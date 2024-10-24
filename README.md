# Matrix Extended

Adds functionality to the native Matrix field type.

## Feature Overview

- Duplication of entries
- Additional delete button on top, if your entry type list is very long 
  - Optionally get rid of that long list 
- Copy&Paste of entries, also in between entry types
- Grouping of entry types
  - Unfold or group ungrouped types
- Drag&Drop of entries, also in between entry types (experimental)

## Requirements

This plugin requires Craft CMS 5.1.0 or later, and PHP 8.2 or later.

## Installation

You can install this plugin from the Plugin Store or with Composer.

#### From the Plugin Store

Go to the Plugin Store in your project’s Control Panel and search for “Matrix Extended”. Then press “Install”.

#### With Composer

Open your terminal and run the following commands:

```bash
# go to the project directory
cd /path/to/my-project.test

# tell Composer to load the plugin
composer require vandres/craft-matrix-extended

# tell Craft to install the plugin
./craft plugin/install matrix-extended
```

## Configuration

You can use the settings dialog in the control panel. But I would recommend creating a `matrix-extended.php` in your config folder. 
That is also the only way (for now), to configure the group buttons. That could look like this:

```php
return [
    'extraDeleteButton' => false,
    'removeEntryTypesFromDiscloseMenu' => true,
    'experimentalFeatures' => true,
    'enableDragDrop' => false,
    'expandMenu' => true,
    'expandUngrouped' => false,
    'ungroupedPosition' => 'start',
    'fields' => [
        'dyncontent' => [ // matrix field handle
            'groups' => [
                [
                    'label' => \Craft::t('app', 'Simple'),
                    'types' => ['header', 'text'], // entry type handles
                ],
            ],
        ],
        'simplecontent' => [ // matrix field handle
            'oneLiner' => true, // prevent buttons from wrapping
            'groups' => [
                [
                    'label' => \Craft::t('app', 'Simple'),
                    'types' => ['header', 'text'], // entry type handles
                ],
            ],
        ]
    ]
];

```

## Roadmap

- ~~duplicate entries~~ (done)
- ~~copy and paste an entry to another position in the same or another entry type~~ (testing)
- ~~copy and paste an entry to another section~~ (testing)
- ~~"Add Block Above" Neo-style~~ (testing)
  - ~~respect `canAddMoreEntries`~~
- ~~Allow "Add Block Above" to be expanded via settings~~ (testing)
  - ~~show as dropdown, if space is not enough~~ (not for now)
  - ~~allow to group buttons~~ (testing)
    - ~~by config~~
    - ~~by settings/backend module~~ (not for now)
- ~~Replace "New Entry" with expanded logic~~ (testing)
- ~~cut and paste an entry~~ (not for now)
- drag and drop between entry types (experimental, testing)
  - drag and drop multiple
  - ~~drag and drop into "empty" matrix~~ (experimental, testing)
  - respect `canAddMoreEntries`
  - let dragdrop and dragsort coexist
  - get rid of warnings

## Support my work

PayPal: https://www.paypal.com/donate/?hosted_button_id=3WDU85HZCKMPA

Buy me a coffee: https://buymeacoffee.com/vandres
