<?php

namespace vandres\matrixextended\web\assets\cp;

use craft\web\AssetBundle;
use craft\web\assets\matrix\MatrixAsset;
use verbb\base\assetbundles\CpAsset;

class MatrixExtendedViteAsset extends AssetBundle
{
    public $sourcePath = '@vandres/matrixextended/web/assets/dist';

    public $depends = [
        CpAsset::class,
        MatrixAsset::class,
    ];
}
