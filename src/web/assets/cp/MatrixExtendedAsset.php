<?php

namespace vandres\matrixextended\web\assets\cp;

use Craft;
use craft\helpers\App;
use craft\helpers\Json;
use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;
use craft\web\assets\matrix\MatrixAsset;
use craft\web\View;
use nystudio107\pluginvite\services\VitePluginService;
use vandres\matrixextended\MatrixExtended;

class MatrixExtendedAsset extends AssetBundle
{
    public $sourcePath = '@vandres/matrixextended/web/assets/dist';

    public $depends = [
        CpAsset::class,
        MatrixAsset::class,
        MatrixExtendedViteAsset::class,
    ];

    public function init()
    {
        $viteServer = 'http://localhost:3004';
        $vite = Craft::createObject([
            'class' => VitePluginService::class,
            'assetClass' => MatrixExtendedViteAsset::class,
            'pluginDevServerEnvVar' => 'VANDRES_PLUGIN_DEVSERVER',
            'useDevServer' => App::env('VANDRES_PLUGIN_DEVSERVER') ?? false,
            'devServerPublic' => $viteServer,
            'serverPublic' => App::env('PRIMARY_SITE_URL'),
            'errorEntry' => 'src/js/matrixExtended.ts',
            'devServerInternal' => $viteServer,
            'checkDevServer' => false,
        ]);

        if ($vite->devServerRunning()) {
            $this->js = [
                "$viteServer/src/js/matrixExtendedHelper.ts",
                "$viteServer/src/js/matrixExtended.ts",
                "$viteServer/src/js/nestedElementExtended.ts",
            ];

            $this->css = [
                "$viteServer/src/css/matrixExtended.scss",
            ];
        } else {
            $this->js = [
                ltrim($vite->entry('src/js/matrixExtendedHelper.ts'), '/'),
                ltrim($vite->entry('src/js/matrixExtended.ts'), '/'),
                ltrim($vite->entry('src/js/nestedElementExtended.ts'), '/'),
            ];

            $this->css = [
                ltrim($vite->entry('src/css/matrixExtended.scss'), '/'),
            ];
        }

        parent::init();
    }

    public function registerAssetFiles($view): void
    {
        parent::registerAssetFiles($view);

        if ($view instanceof View) {
            $view->registerTranslations('matrix-extended', [
                'Duplicate',
                'Copy',
                'Paste',
                'Delete',
                'Start',
                'End',
                'Enable drag and drop',
                'Enable drag and drop support, even allowing dragging between matrix fields.',
                'Where to position the ungrouped elements?',
                'Ungrouped position',
                'Where to position the ungrouped elements?',
                'Expand ungrouped',
                'Expands ungrouped elements, instead of grouping them under "New Entry".',
                'Expand menu',
                'Displays "add block" menu as button group.',
                'Entry reference copied',
                'There was an error copying the entry reference',
                'There was an error duplicating the entry',
                'There was an error pasting the entry',
                'There was an error dropping the entry',
                'Add block above',
                'There is nothing to paste.',
                'The copied entry is not allowed here.',
                'No more entries can be added.',
            ]);
        }

        $data = [
            'settings' => MatrixExtended::getInstance()->getSettings(),
            'childParent' => MatrixExtended::getInstance()->service->getChildParentRelations(),
            'entryTypes' => MatrixExtended::getInstance()->service->getEntryTypes(),
        ];
        $config = Json::encode($data);

        $js = <<<JS
            const helper = new window.Craft.MatrixExtendedHelper($config);
            if (window.Craft.MatrixExtended) {
                new window.Craft.MatrixExtended($config, helper);
            }
            if (window.Craft.NestedElementExtended) {
                new window.Craft.NestedElementExtended($config, helper);
            }
        JS;
        $view->registerJs($js, View::POS_END);
    }
}
