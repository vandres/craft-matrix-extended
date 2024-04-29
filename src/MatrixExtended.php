<?php

namespace vandres\matrixextended;

use Craft;
use craft\base\Plugin;
use vandres\matrixextended\web\assets\cp\AssetBundle;

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
    public string $schemaVersion = '1.0.0';

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

            \Craft::$app->getView()->registerAssetBundle(AssetBundle::class);
        });
    }
}
