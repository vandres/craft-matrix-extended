<?php

namespace vandres\matrixextended\web\assets\cp;

use craft\web\AssetBundle as BaseAssetBundle;
use craft\web\assets\cp\CpAsset;
use craft\web\assets\matrix\MatrixAsset;
use craft\web\View;

class AssetBundle extends BaseAssetBundle
{
    public $sourcePath = '@vandres/matrixextended/web/assets';

    public $depends = [
        CpAsset::class,
        MatrixAsset::class,
    ];

    public $css = [];

    public $js = ['matrix-extended.js'];

    public function registerAssetFiles($view): void
    {
        parent::registerAssetFiles($view);

        if ($view instanceof View) {
            $view->registerTranslations('app', ['Duplicate']);
        }

        $js = <<<JS
            if (window.Craft.MatrixExtension) {
                new window.Craft.MatrixExtension();
            }
        JS;
        $view->registerJs($js, View::POS_END);
    }
}
