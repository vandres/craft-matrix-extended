<?php

namespace vandres\matrixextended\models;

use craft\base\Model;

class Settings extends Model
{
    public bool $removeEntryTypesFromDiscloseMenu = false;

    public bool $enableDragDrop = false;

    public bool $enableAddBlockAbove = true;

    public bool $expandMenu = false;

    public bool $expandUngrouped = false;

    public string $ungroupedPosition = 'start';

    public array $fields = [];

    public function defineRules(): array
    {
        return [
            [['enableAddBlockAbove', 'expandMenu', 'expandUngrouped', 'enableDragDrop', 'removeEntryTypesFromDiscloseMenu'], 'boolean'],
            [['ungroupedPosition'], 'in', 'range' => ['start', 'end', 'hidden']],
        ];
    }
}
