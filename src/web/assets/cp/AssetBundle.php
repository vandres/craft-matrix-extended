<?php

namespace vandres\matrixextended\web\assets\cp;

use craft\helpers\Json;
use craft\web\AssetBundle as BaseAssetBundle;
use craft\web\assets\cp\CpAsset;
use craft\web\assets\matrix\MatrixAsset;
use craft\web\View;
use vandres\matrixextended\MatrixExtended;

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
            $view->registerTranslations('app', [
                'Duplicate',
                'Copy',
                'Paste',
                'Entry reference copied',
                'There was an error copying the entry reference',
            ]);
        }

        $data = ['settings' => MatrixExtended::getInstance()->getSettings()];
        $config = Json::encode($data);

        $js = <<<JS
            if (window.Craft.MatrixExtension) {
                new window.Craft.MatrixExtension($config);
            }
        JS;
        $view->registerJs($js, View::POS_END);
    }
}
