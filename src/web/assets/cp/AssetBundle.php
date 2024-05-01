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

    public $css = ['matrix-extended.css'];

    public $js = ['matrix-extended.js'];

    public function registerAssetFiles($view): void
    {
        parent::registerAssetFiles($view);

        if ($view instanceof View) {
            $view->registerTranslations('matrix-extended', [
                'Duplicate',
                'Copy',
                'Paste',
                'Delete',
                'Entry reference copied',
                'There was an error copying the entry reference',
                'There was an error duplicating the entry',
                'There was an error pasting the entry',
                'Add block above',
                'There is nothing to paste.',
                'The copied entry is not allowed here.',
            ]);
        }

        $data = [
            'settings' => MatrixExtended::getInstance()->getSettings(),
            'childParent' => MatrixExtended::getInstance()->service->getChildParentRelations(),
            'entryReference' => MatrixExtended::getInstance()->service->getReference(),
        ];
        $config = Json::encode($data);

        $js = <<<JS
            if (window.Craft.MatrixExtension) {
                new window.Craft.MatrixExtension($config);
            }
        JS;
        $view->registerJs($js, View::POS_END);
    }
}
