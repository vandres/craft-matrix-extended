<?php

namespace vandres\matrixextended\web\assets\cp;

use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;
use craft\web\assets\matrix\MatrixAsset;

class MatrixExtendedViteAsset extends AssetBundle
{
    public $sourcePath = '@vandres/matrixextended/web/assets/dist';

    public $depends = [
        CpAsset::class,
        MatrixAsset::class,
    ];
}
