<?php

namespace vandres\matrixextended\controllers;

use Craft;
use craft\base\ElementInterface;
use craft\base\NestedElementInterface;
use craft\elements\db\ElementQueryInterface;
use craft\fields\Matrix;
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
        $entry = MatrixExtended::getInstance()->service->getElementById($entryId, true, 'craft\elements\Entry', $user, $siteId, [], $ownerId, $fieldId);
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
        $duplicatedEntry = MatrixExtended::getInstance()->service->cloneEntry($entry, $ownerId, $siteId);

        return $this->asJson($duplicatedEntry);
    }

    /**
     * Copies an entry reference to the user session, so it can be pasted later
     *
     * @return Response
     */
    public function actionCopyEntry(): Response
    {
        $entryId = $this->request->getRequiredBodyParam('entryId');
        $fieldId = $this->request->getRequiredBodyParam('fieldId');
        $entryTypeId = $this->request->getRequiredBodyParam('entryTypeId');
        $ownerId = $this->request->getRequiredBodyParam('ownerId');
        $ownerElementType = $this->request->getRequiredBodyParam('ownerElementType');
        $siteId = $this->request->getRequiredBodyParam('siteId');

        $elementsService = Craft::$app->getElements();
        $user = static::currentUser();
        $entry = MatrixExtended::getInstance()->service->getElementById($entryId, true, 'craft\elements\Entry', $user, $siteId, [], $ownerId, $fieldId);
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
     * Get the latest entry reference from the user session and clones that entry at the given position.
     *
     * @return Response
     */
    public function actionPasteEntry(): Response
    {
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
        $user = static::currentUser();
        $entry = MatrixExtended::getInstance()->service->getElementById($entryReference['entryId'], true, $entryReference['ownerElementType'], $user, $entryReference['siteId'], [], $entryReference['ownerId'], $entryReference['fieldId']);
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

        $relation = MatrixExtended::getInstance()->service->getElementById($entryId, true, $ownerElementType, $user, $siteId, [], $ownerId, $fieldId);

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
                ->keyBy(fn(ElementInterface $element) => $relation->id)
                /** @phpstan-ignore-next-line */
                ->map(fn(NestedElementInterface $element) => $element->getSortOrder())
                ->all();
        }

        $sortOrder = array_key_exists($relation->id, $oldSortOrders) ? $oldSortOrders[$relation->id] : null;
        $duplicatedEntry = MatrixExtended::getInstance()->service->cloneEntry($entry, $ownerId, $siteId, ['owner' => $owner, 'sortOrder' => $sortOrder]);

        return $this->asJson($duplicatedEntry);
    }
}
