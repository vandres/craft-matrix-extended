<?php

namespace vandres\matrixextended\services;

use Craft;
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

    public function setReference($reference): void
    {
        Craft::$app->getSession()->set('matrixExtendedReference' . MatrixExtended::getInstance()->schemaVersion, $reference);
    }

    public function getReference(): ?array
    {
        return Craft::$app->getSession()->get('matrixExtendedReference' . MatrixExtended::getInstance()->schemaVersion) ?: null;
    }
}
