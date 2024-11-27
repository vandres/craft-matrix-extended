<?php

namespace vandres\matrixextended\services;

use Craft;
use craft\base\Element;
use craft\base\ElementInterface;
use craft\elements\db\AssetQuery;
use craft\elements\db\ElementQueryInterface;
use craft\elements\db\EntryQuery;
use craft\elements\db\NestedElementQueryInterface;
use craft\elements\Entry;
use craft\elements\User;
use craft\helpers\ElementHelper;
use craft\helpers\StringHelper;
use vandres\matrixextended\MatrixExtended;

class MatrixService
{
    /**
     * Returns a list, which child can have which parent.
     *
     * e.g.
     * ```
     * [
     *   35 => [
     *     18, 4, 51
     *   ],
     *   ...
     * ]
     * ```
     *
     * @return array
     */
    public function getChildParentRelations(): array
    {
        $relations = [];
        $entryTypes = Craft::$app->getEntries()->getAllEntryTypes();

        foreach ($entryTypes as $entryType) {
            $relations[$entryType->id] = array_map(fn($usage) => $usage->id, $entryType->findUsages());
        }

        return $relations;
    }

    /**
     * The matrix can have different view modes ('blocks', 'cards', 'index')
     * Return only the ones, with view mode 'blocks' (inline editable)
     *
     * @return array
     */
    public function getMatrixInputs(): array
    {
        $matrixInputs = [];
        $fields = Craft::$app->getFields()->getAllFields();

        foreach ($fields as $field) {
            if (!($field instanceof \craft\fields\Matrix)) {
                continue;
            }
            if ($field->viewMode !== \craft\fields\Matrix::VIEW_MODE_BLOCKS) {
                continue;
            }

            $matrixInputs[] = $field->id;
        }

        return $matrixInputs;
    }

    public function setReference($reference): void
    {
        Craft::$app->getSession()->set('matrixExtendedReference' . MatrixExtended::getInstance()->schemaVersion, $reference);
    }

    public function getReference(): ?array
    {
        return Craft::$app->getSession()->get('matrixExtendedReference' . MatrixExtended::getInstance()->schemaVersion) ?: null;
    }

    public function cloneEntry(Entry $entry, $ownerId, $siteId = null, $attributes = [])
    {
        $elementsService = Craft::$app->getElements();

        // With Craft 5.5.x, the native Duplication started working
        if (version_compare(\Craft::$app->getVersion(), '5.5.0', '>=')) {
            return $elementsService->duplicateElement($entry, $attributes);
        }

        // Ensure all fields have been normalized
        $entry->getFieldValues();

        $owner = $elementsService->getElementById($ownerId, 'craft\elements\Entry', $siteId);

        $duplicatedEntry = Craft::createObject([
            'class' => Entry::class,
            'siteId' => $entry->siteId,
            'uid' => StringHelper::UUID(),
            'typeId' => $entry->typeId,
            'fieldId' => $entry->fieldId,
            'owner' => $owner,
            'title' => $entry->title,
            'slug' => ElementHelper::tempSlug(),
            'fieldValues' => $entry->getFieldValues(),
        ]);
        $duplicatedEntry->setScenario(Element::SCENARIO_ESSENTIALS);
        $children = [];
        $transaction = Craft::$app->getDb()->beginTransaction();

        try {
            $dirtyFields = $duplicatedEntry->getDirtyFields();
            $saveLater = [];
            foreach ($entry->getFieldValues() as $handle => $value) {
                if ($value instanceof AssetQuery) {
                    $saveLater[] = [
                        'handle' => $handle,
                        'value' => $value,
                    ];
                } else if ($value instanceof EntryQuery) {
                    $elements = $value->status(null)->all();
                    $matrixElements = array_filter($elements, function ($element) {
                        return !!$element->fieldId;
                    });

                    if (empty($matrixElements)) {
                        $saveLater[] = [
                            'handle' => $handle,
                            'value' => $value,
                        ];
                    } else {
                        $children[] = ['owner' => $entry->id, 'handle' => $handle, 'elements' => $matrixElements];
                    }
                } else if (is_object($value) && !$value instanceof \UnitEnum) {
                    $duplicatedEntry->setFieldValue($handle, clone $value);
                }
            }
            $duplicatedEntry->setDirtyFields($dirtyFields, false);
            if (!$elementsService->saveElement($duplicatedEntry, false)) {
                throw new \Exception('Could not save element on cloning process');
            }

            foreach ($children as $child) {
                foreach ($child['elements'] as $childElement) {
                    $this->cloneEntry($childElement, $duplicatedEntry->id, $siteId);
                }
            }

            if (!empty($saveLater)) {
                foreach ($saveLater as $field) {
                    $duplicatedEntry->setFieldValue($field['handle'], clone $field['value']);
                }

                if (!$elementsService->saveElement($duplicatedEntry, false)) {
                    throw new \Exception('Could not save element on cloning process');
                }
            }

            $transaction->commit();
        } catch (\Exception $e) {
            $transaction->rollBack();
            throw $e;
        }

        return $duplicatedEntry;
    }

    public function getElementById(
        int            $elementId,
        bool           $checkForProvisionalDraft,
        string         $elementType,
        User           $user,
        int|array|null $siteId,
        ?array         $preferSites,
                       $ownerId,
                       $fieldId,
    ): ?ElementInterface
    {
//        $elementsService = Craft::$app->getElements();
//        return $elementsService->getElementById($elementId, $elementType, $siteId);

        // First check for a provisional draft, if we're open to it
        if ($checkForProvisionalDraft) {
            $element = $this->_elementQuery($elementType, $ownerId, $fieldId)
                ->provisionalDrafts()
                ->draftOf($elementId)
                ->draftCreator($user)
                ->siteId($siteId)
                ->preferSites($preferSites)
                ->unique()
                ->status(null)
                ->one();

            if ($element && $element->canSave($user)) {
                return $element;
            }
        }

        $element = $this->_elementQuery($elementType, $ownerId, $fieldId)
            ->id($elementId)
            ->siteId($siteId)
            ->preferSites($preferSites)
            ->unique()
            ->status(null)
            ->one();

        if ($element) {
            return $element;
        }

        // finally, check for an unpublished draft
        // (see https://github.com/craftcms/cms/issues/14199)
        return $this->_elementQuery($elementType, $ownerId, $fieldId)
            ->id($elementId)
            ->siteId($siteId)
            ->preferSites($preferSites)
            ->unique()
            ->draftOf(false)
            ->status(null)
            ->one();
    }

    /**
     * @param class-string<ElementInterface> $elementType
     * @return ElementQueryInterface
     */
    private function _elementQuery(string $elementType, $ownerId, $fieldId): ElementQueryInterface
    {
        $query = $elementType::find();
        if ($query instanceof NestedElementQueryInterface) {
            $query
                ->fieldId($fieldId)
                ->ownerId($ownerId);
        }
        return $query;
    }
}
