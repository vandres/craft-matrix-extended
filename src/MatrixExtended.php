<?php

namespace vandres\matrixextended;

use Craft;
use craft\base\Model;
use craft\base\Plugin;
use vandres\matrixextended\models\Settings;
use vandres\matrixextended\services\MatrixService;
use vandres\matrixextended\web\assets\cp\MatrixExtendedAsset;

/**
 * Matrix Extended plugin
 *
 * @method static MatrixExtended getInstance()
 * @author Volker Andres <andres@voan.ch>
 * @copyright Volker Andres
 * @license https://craftcms.github.io/license/ Craft License
 */
class MatrixExtended extends Plugin
{
    public string $schemaVersion = '3.1.0';

    public bool $hasCpSettings = true;

    public static function config(): array
    {
        return [
            'components' => [
                'service' => MatrixService::class,
            ],
        ];
    }

    public function init(): void
    {
        parent::init();

        $this->setUp();
        $this->setUpSite();
        $this->setUpCp();
    }

    protected function createSettingsModel(): ?Model
    {
        return Craft::createObject(Settings::class);
    }

    protected function settingsHtml(): ?string
    {
        // Get and pre-validate the settings
        $settings = $this->getSettings();
        $settings->validate();

        // Get the settings that are being defined by the config file
        $overrides = Craft::$app->getConfig()->getConfigFromFile(strtolower($this->handle));

        return Craft::$app->view->renderTemplate('matrix-extended/_settings.twig', [
            'plugin' => $this,
            'overrides' => array_keys($overrides),
            'settings' => $settings,
        ]);
    }

    private function setUp()
    {
        Craft::$app->onInit(function () {
        });
    }

    private function setUpSite()
    {
        Craft::$app->onInit(function () {
            if (!Craft::$app->getRequest()->getIsSiteRequest()) {
                return;
            }
        });
    }

    private function setUpCp()
    {
        Craft::$app->onInit(function () {
            if (!Craft::$app->getRequest()->getIsCpRequest()) {
                return;
            }

            \Craft::$app->getView()->registerAssetBundle(MatrixExtendedAsset::class);
        });
    }
}
