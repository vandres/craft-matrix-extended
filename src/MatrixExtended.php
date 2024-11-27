<?php

namespace vandres\matrixextended;

use Craft;
use craft\base\Model;
use craft\base\Plugin;
use craft\events\DefineElementHtmlEvent;
use craft\helpers\Cp;
use craft\helpers\Html;
use vandres\matrixextended\models\Settings;
use vandres\matrixextended\services\MatrixService;
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

            // Make sure element cards and chips have a [data-type-id] attribute, which we'll use to bootstrap an "Edit Entry Type" link in their settings menus
            foreach ([Cp::EVENT_DEFINE_ELEMENT_CARD_HTML, Cp::EVENT_DEFINE_ELEMENT_CHIP_HTML] as $eventName) {
                Event::on(
                    Cp::class,
                    $eventName,
                    static function (DefineElementHtmlEvent $event) {
                        $typeId = $event->element?->typeId ?? null;
                        if (empty($typeId)) {
                            return;
                        }
                        try {
                            $html = Html::modifyTagAttributes($event->html, [
                                'data-type-id' => $typeId,
                            ]);
                        } catch (\Throwable $e) {
                            Craft::error($e, __METHOD__);
                            return;
                        }
                        $event->html = $html;
                    }
                );
            }
        });
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
}
