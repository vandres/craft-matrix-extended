<?php

namespace vandres\matrixextended\models;

use craft\base\Model;

class Settings extends Model
{
    public bool $experimentalFeatures = false;

    public bool $expandMenu = false;

    public function defineRules(): array
    {
        return [
            [['experimentalFeatures', 'expandMenu'], 'boolean'],
        ];
    }
}
