<?php

namespace vandres\matrixextended\controllers;

use Craft;
use craft\base\Element;
use craft\base\ElementInterface;
use craft\base\NestedElementInterface;
use craft\elements\db\AssetQuery;
use craft\elements\db\ElementQueryInterface;
use craft\elements\db\EntryQuery;
use craft\elements\db\NestedElementQueryInterface;
use craft\elements\Entry;
use craft\elements\User;
use craft\fields\Matrix;
use craft\helpers\ElementHelper;
use craft\helpers\StringHelper;
use vandres\matrixextended\MatrixExtended;
use vandres\matrixextended\models\Settings;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\Response;

class NestedElementExtendedController extends \craft\web\Controller
{
    private ?Settings $settings;

    public function beforeAction($action): bool
    {
        if (!parent::beforeAction($action)) {
            return false;
        }

        $this->requireCpRequest();

        $this->settings = MatrixExtended::getInstance()->getSettings();
        return true;
    }

    /**
     * Creates a new entry with the content of another
     *
     * @return Response
     */
    public function actionDuplicateEntry(): Response
    {
        if (!$this->settings->experimentalFeatures) {
            throw new ForbiddenHttpException('Experimental features not enabled.');
        }

        $entryId = $this->request->getRequiredBodyParam('entryId');
        $fieldId = $this->request->getRequiredBodyParam('fieldId');
        $ownerId = $this->request->getRequiredBodyParam('ownerId');
        $ownerElementType = $this->request->getRequiredBodyParam('ownerElementType');
        $siteId = $this->request->getRequiredBodyParam('siteId');

        $elementsService = Craft::$app->getElements();
        $user = static::currentUser();
        $entry = $this->getElementById($entryId, true, 'craft\elements\Entry', $user, $siteId, [], $ownerId, $fieldId);
        if (!$entry) {
            throw new BadRequestHttpException("Invalid entry ID, element type, or site ID.");
        }
        $owner = $elementsService->getElementById($ownerId, $ownerElementType, $siteId);
        if (!$owner) {
            throw new BadRequestHttpException("Invalid owner ID, element type, or site ID.");
        }

        $field = $owner->getFieldLayout()?->getFieldById($fieldId);
        if (!$field instanceof Matrix) {
            throw new BadRequestHttpException("Invalid Matrix field ID: $fieldId");
        }

        $site = Craft::$app->getSites()->getSiteById($siteId, true);
        if (!$site) {
            throw new BadRequestHttpException("Invalid site ID: $siteId");
        }

        if (!$entry->canSave($user)) {
            throw new ForbiddenHttpException('User not authorized to duplicate this element.');
        }

        $attribute = 'field:dyncontent';
        $nestedElements = $owner->$attribute;

        if ($nestedElements instanceof ElementQueryInterface) {
            $oldSortOrders = (clone $nestedElements)
                ->status(null)
                ->asArray()
                ->select(['id', 'sortOrder'])
                ->pairs();
        } else {
            $oldSortOrders = $nestedElements
                ->keyBy(fn(ElementInterface $element) => $element->id)
                /** @phpstan-ignore-next-line */
                ->map(fn(NestedElementInterface $element) => $element->getSortOrder())
                ->all();
        }

        $entry->sortOrder = array_key_exists($entry->id, $oldSortOrders) ? $oldSortOrders[$entry->id] : 0;
        $duplicatedEntry = $this->cloneEntry($entry, $ownerId, $siteId);

        return $this->asJson($duplicatedEntry);
    }

    private function getElementById(
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

    private function cloneEntry(Entry $entry, $ownerId, $siteId = null)
    {
        $elementsService = Craft::$app->getElements();

        // With Craft 5.5.x, the native Duplication started working
        if (version_compare(\Craft::$app->getVersion(), '5.5.0', '>=')) {
            return $elementsService->duplicateElement($entry);
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
}
