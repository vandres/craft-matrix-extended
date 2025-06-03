<?php

namespace vandres\matrixextended\controllers;

use Craft;
use craft\elements\db\EntryQuery;
use craft\elements\ElementCollection;
use craft\elements\Entry;
use craft\fields\Matrix;
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
     * Duplicate an entry, but adds it with new owner
     *
     * @return Response
     */
    public function actionDuplicateEntryWithNewOwner(): Response
    {
        if (!$this->settings->enableDragDrop) {
            throw new ForbiddenHttpException('Drag&Drop is not enabled.');
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

        $duplicatedEntry = MatrixExtended::getInstance()->service->cloneEntry($entry, $ownerId, $siteId);

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
