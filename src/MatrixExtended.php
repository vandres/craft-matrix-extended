<?php

namespace vandres\matrixextended;

use Craft;
use craft\base\Model;
use craft\base\Plugin;
use craft\web\twig\variables\CraftVariable;
use nystudio107\pluginvite\services\VitePluginService;
use vandres\matrixextended\models\Settings;
use vandres\matrixextended\services\MatrixService;
use vandres\matrixextended\variables\MatrixExtendedVariable;
use vandres\matrixextended\web\assets\cp\MatrixExtendedAsset;
use yii\base\Event;

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
    public string $schemaVersion = '2.1.0';

    public bool $hasCpSettings = true;

    public static function config(): array
    {
        return [
            'components' => [
                'service' => MatrixService::class,
                'vite' => [
                    'class' => VitePluginService::class,
                    'assetClass' => MatrixExtendedAsset::class,
                    'useDevServer' => true,
                    'devServerPublic' => 'http://localhost:3004',
                    'serverPublic' => 'https://craft-voan.ddev.site:8443',
                    'errorEntry' => 'src/js/matrixExtended.ts',
                    'devServerInternal' => 'http://localhost:3004',
                    'checkDevServer' => true,
                ],
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

            Event::on(
                CraftVariable::class,
                CraftVariable::EVENT_INIT,
                function (Event $event) {
                    /** @var CraftVariable $variable */
                    $variable = $event->sender;
                    $variable->set('matrixExtended', [
                        'class' => MatrixExtendedVariable::class,
                        'viteService' => $this->vite,
                    ]);

                    $variable->matrixExtended->register('src/js/matrixExtended.ts', false, ['depends' => MatrixExtendedAsset::class]);
                }
            );

            \Craft::$app->getView()->registerAssetBundle(MatrixExtendedAsset::class);
        });
    }
}
