<?php

namespace vandres\matrixextended\controllers;

use Craft;
use craft\base\Element;
use craft\elements\db\EntryQuery;
use craft\elements\ElementCollection;
use craft\elements\Entry;
use craft\fields\Matrix;
use craft\helpers\ElementHelper;
use craft\helpers\StringHelper;
use vandres\matrixextended\MatrixExtended;
use vandres\matrixextended\models\Settings;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\Response;

class MatrixExtendedController extends \craft\web\Controller
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
     * Creates a new entry with the content of another and renders its block UI.
     *
     * @return Response
     */
    public function actionDuplicateEntry(): Response
    {
        $entryId = $this->request->getRequiredBodyParam('entryId');
        $fieldId = $this->request->getRequiredBodyParam('fieldId');
        $entryTypeId = $this->request->getRequiredBodyParam('entryTypeId');
        $ownerId = $this->request->getRequiredBodyParam('ownerId');
        $ownerElementType = $this->request->getRequiredBodyParam('ownerElementType');
        $siteId = $this->request->getRequiredBodyParam('siteId');
        $namespace = $this->request->getRequiredBodyParam('namespace');
        $staticEntries = $this->request->getBodyParam('staticEntries', false);

        $elementsService = Craft::$app->getElements();
        $entry = $elementsService->getElementById($entryId, $ownerElementType, $siteId);
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

        $entryType = Craft::$app->getEntries()->getEntryTypeById($entryTypeId);
        if (!$entryType) {
            throw new BadRequestHttpException("Invalid entry type ID: $entryTypeId");
        }

        $site = Craft::$app->getSites()->getSiteById($siteId, true);
        if (!$site) {
            throw new BadRequestHttpException("Invalid site ID: $siteId");
        }

        $user = static::currentUser();
        if (!$entry->canSave($user)) {
            throw new ForbiddenHttpException('User not authorized to duplicate this element.');
        }

        $duplicatedEntry = $this->cloneEntry($entry, $ownerId);

        /** @var EntryQuery|ElementCollection $value */
        $value = $owner->getFieldValue($field->handle);

        $view = $this->getView();
        /** @var Entry[] $entries */
        $entries = $value->all();
        $html = $view->namespaceInputs(fn() => $view->renderTemplate('_components/fieldtypes/Matrix/block.twig', [
            'name' => $field->handle,
            'entryTypes' => $field->getEntryTypesForField($entries, $owner),
            'entry' => $duplicatedEntry,
            'isFresh' => true,
            'staticEntries' => $staticEntries,
        ]), $namespace);

        return $this->asJson([
            'blockHtml' => $html,
            'headHtml' => $view->getHeadHtml(),
            'bodyHtml' => $view->getBodyHtml(),
        ]);
    }

    private function cloneEntry(Entry $entry, $ownerId)
    {
        $elementsService = Craft::$app->getElements();

        $owner = $elementsService->getElementById($ownerId);

        // Ensure all fields have been normalized
        $entry->getFieldValues();

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
            foreach ($entry->getFieldValues() as $handle => $value) {
                if ($value instanceof EntryQuery) {
                    $children[] = ['owner' => $entry->id, 'handle' => $handle, 'elements' => $value->status(null)->all()];
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
                    $this->cloneEntry($childElement, $duplicatedEntry->id);
                }
            }

            $transaction->commit();
        } catch (\Exception $e) {
            $transaction->rollBack();
            throw $e;
        }

        return $duplicatedEntry;
    }

    /**
     * Copies an entry reference to the user session, so it can be pasted later
     *
     * @return Response
     */
    public function actionCopyEntry(): Response
    {
        if (!$this->settings->experimentalFeatures) {
            throw new ForbiddenHttpException('Experimental features not enabled.');
        }

        $entryId = $this->request->getRequiredBodyParam('entryId');
        $fieldId = $this->request->getRequiredBodyParam('fieldId');
        $entryTypeId = $this->request->getRequiredBodyParam('entryTypeId');
        $ownerId = $this->request->getRequiredBodyParam('ownerId');
        $ownerElementType = $this->request->getRequiredBodyParam('ownerElementType');
        $siteId = $this->request->getRequiredBodyParam('siteId');
        $namespace = $this->request->getRequiredBodyParam('namespace');
        $staticEntries = $this->request->getBodyParam('staticEntries', false);

        $elementsService = Craft::$app->getElements();
        $entry = $elementsService->getElementById($entryId, $ownerElementType, $siteId);
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

        $entryType = Craft::$app->getEntries()->getEntryTypeById($entryTypeId);
        if (!$entryType) {
            throw new BadRequestHttpException("Invalid entry type ID: $entryTypeId");
        }

        $site = Craft::$app->getSites()->getSiteById($siteId, true);
        if (!$site) {
            throw new BadRequestHttpException("Invalid site ID: $siteId");
        }

        $entryReference = [
            'entryId' => $entryId,
            'fieldId' => $fieldId,
            'entryTypeId' => $entryTypeId,
            'ownerId' => $ownerId,
            'ownerElementType' => $ownerElementType,
            'siteId' => $siteId,
            'namespace' => $namespace,
            'staticEntries' => $staticEntries,
        ];
        MatrixExtended::getInstance()->service->setReference($entryReference);

        $view = $this->getView();

        return $this->asJson([
            'entryReference' => $entryReference,
            'headHtml' => $view->getHeadHtml(),
            'bodyHtml' => $view->getBodyHtml(),
        ]);
    }

    /**
     * Duplicate an entry, but adds it with new owner
     *
     * @return Response
     */
    public function actionDuplicateEntryWithNewOwner(): Response
    {
        if (!$this->settings->experimentalFeatures || !$this->settings->enableDragDrop) {
            throw new ForbiddenHttpException('Experimental features not enabled.');
        }

        $entryId = $this->request->getRequiredBodyParam('entryId');
        $fieldId = $this->request->getRequiredBodyParam('fieldId');
        $entryTypeId = $this->request->getRequiredBodyParam('entryTypeId');
        $ownerId = $this->request->getRequiredBodyParam('ownerId');
        $ownerElementType = $this->request->getRequiredBodyParam('ownerElementType');
        $siteId = $this->request->getRequiredBodyParam('siteId');
        $namespace = $this->request->getRequiredBodyParam('namespace');
        $staticEntries = $this->request->getBodyParam('staticEntries', false);

        $elementsService = Craft::$app->getElements();
        $entryReference = $elementsService->getElementById($entryId, $ownerElementType, $siteId);
        if (!$entryReference) {
            throw new BadRequestHttpException("There is nothing to drop");
        }

        $owner = $elementsService->getElementById($ownerId, $ownerElementType, $siteId);
        if (!$owner) {
            throw new BadRequestHttpException("Invalid owner ID, element type, or site ID.");
        }

        $field = $owner->getFieldLayout()?->getFieldById($fieldId);
        if (!$field instanceof Matrix) {
            throw new BadRequestHttpException("Invalid Matrix field ID: $fieldId");
        }

        $entryType = Craft::$app->getEntries()->getEntryTypeById($entryTypeId);
        if (!$entryType) {
            throw new BadRequestHttpException("Invalid entry type ID: $entryTypeId");
        }

        $site = Craft::$app->getSites()->getSiteById($siteId, true);
        if (!$site) {
            throw new BadRequestHttpException("Invalid site ID: $siteId");
        }

        // check destination
        $elementsService = Craft::$app->getElements();
        $entry = $elementsService->getElementById($entryReference->id, $entryReference::class, $entryReference->siteId);
        if (!$entry) {
            throw new BadRequestHttpException("Invalid entry ID, element type, or site ID.");
        }
        $user = static::currentUser();
        if (!$entry->canSave($user)) {
            throw new ForbiddenHttpException('User not authorized to duplicate this element.');
        }

        $childParent = MatrixExtended::getInstance()->service->getChildParentRelations() ?? [];
        if (!in_array($fieldId, $childParent[$entry->typeId])) {
            throw new BadRequestHttpException('That entry type cannot be pasted in that element.');
        }

        $duplicatedEntry = $this->cloneEntry($entry, $ownerId);

        /** @var EntryQuery|ElementCollection $value */
        $value = $owner->getFieldValue($field->handle);

        $view = $this->getView();
        /** @var Entry[] $entries */
        $entries = $value->all();
        $html = $view->namespaceInputs(fn() => $view->renderTemplate('_components/fieldtypes/Matrix/block.twig', [
            'name' => $field->handle,
            'entryTypes' => $field->getEntryTypesForField($entries, $owner),
            'entry' => $duplicatedEntry,
            'isFresh' => true,
            'staticEntries' => $staticEntries,
        ]), $namespace);

        return $this->asJson([
            'blockHtml' => $html,
            'headHtml' => $view->getHeadHtml(),
            'bodyHtml' => $view->getBodyHtml(),
        ]);
    }

    /**
     * Get the latest entry reference from the user session and clones that entry at the given position.
     *
     * @return Response
     */
    public function actionPasteEntry(): Response
    {
        if (!$this->settings->experimentalFeatures) {
            throw new ForbiddenHttpException('Experimental features not enabled.');
        }

        // check source
        $entryReference = MatrixExtended::getInstance()->service->getReference();
        if (empty($entryReference)) {
            throw new BadRequestHttpException("There is nothing to paste");
        }

        $entryId = $this->request->getRequiredBodyParam('entryId'); // unused (where did the user click)
        $fieldId = $this->request->getRequiredBodyParam('fieldId');
        $entryTypeId = $this->request->getRequiredBodyParam('entryTypeId');
        $ownerId = $this->request->getRequiredBodyParam('ownerId');
        $ownerElementType = $this->request->getRequiredBodyParam('ownerElementType');
        $siteId = $this->request->getRequiredBodyParam('siteId');
        $namespace = $this->request->getRequiredBodyParam('namespace');
        $staticEntries = $this->request->getBodyParam('staticEntries', false);

        $elementsService = Craft::$app->getElements();
        $owner = $elementsService->getElementById($ownerId, $ownerElementType, $siteId);
        if (!$owner) {
            throw new BadRequestHttpException("Invalid owner ID, element type, or site ID.");
        }

        $field = $owner->getFieldLayout()?->getFieldById($fieldId);
        if (!$field instanceof Matrix) {
            throw new BadRequestHttpException("Invalid Matrix field ID: $fieldId");
        }

        $entryType = Craft::$app->getEntries()->getEntryTypeById($entryTypeId);
        if (!$entryType) {
            throw new BadRequestHttpException("Invalid entry type ID: $entryTypeId");
        }

        $site = Craft::$app->getSites()->getSiteById($siteId, true);
        if (!$site) {
            throw new BadRequestHttpException("Invalid site ID: $siteId");
        }

        // check destination
        $elementsService = Craft::$app->getElements();
        $entry = $elementsService->getElementById($entryReference['entryId'], $entryReference['ownerElementType'], $entryReference['siteId']);
        if (!$entry) {
            throw new BadRequestHttpException("Invalid entry ID, element type, or site ID.");
        }
        $user = static::currentUser();
        if (!$entry->canSave($user)) {
            throw new ForbiddenHttpException('User not authorized to duplicate this element.');
        }

        $childParent = MatrixExtended::getInstance()->service->getChildParentRelations() ?? [];
        if (!in_array($fieldId, $childParent[$entry->typeId])) {
            throw new BadRequestHttpException('That entry type cannot be pasted in that element.');
        }

        $duplicatedEntry = $this->cloneEntry($entry, $ownerId);

        /** @var EntryQuery|ElementCollection $value */
        $value = $owner->getFieldValue($field->handle);

        $view = $this->getView();
        /** @var Entry[] $entries */
        $entries = $value->all();
        $html = $view->namespaceInputs(fn() => $view->renderTemplate('_components/fieldtypes/Matrix/block.twig', [
            'name' => $field->handle,
            'entryTypes' => $field->getEntryTypesForField($entries, $owner),
            'entry' => $duplicatedEntry,
            'isFresh' => true,
            'staticEntries' => $staticEntries,
        ]), $namespace);

        return $this->asJson([
            'blockHtml' => $html,
            'headHtml' => $view->getHeadHtml(),
            'bodyHtml' => $view->getBodyHtml(),
        ]);
    }
}
