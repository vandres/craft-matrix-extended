<?php

namespace vandres\matrixextended\models;

use craft\base\Model;

class Settings extends Model
{
    public bool $experimentalFeatures = false;

    public bool $expandMenu = false;

    public bool $expandUngrouped = false;

    public string $ungroupedPosition = 'start';

    public array $fields = [];

    public function defineRules(): array
    {
        return [
            [['experimentalFeatures', 'expandMenu', 'expandUngrouped'], 'boolean'],
            [['ungroupedPosition'], 'in', 'range' => ['start', 'end']],
        ];
    }
}
