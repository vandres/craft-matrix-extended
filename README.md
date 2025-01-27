# Matrix Extended

Adds functionality to the native Matrix field type.

## Feature Overview

- Duplication of entries
- Additional delete button on top, if your entry type list is very long 
  - Optionally get rid of that long list 
- Copy&Paste of entries, also in between entry types
- Grouping of entry types
  - Unfold or group ungrouped types
- Supported View Modes:
  - Inline-Editable Blocks: Yes
  - Cards: Yes (requires Craft 5.5.5+)
  - Element-Index: No
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
    'enableDuplicate' => true,
    'enableCopyPaste' => true,
    'enableAddBlockAbove' => true,
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

## Important updates

### v3 -> v4

In v3, the plugin worked around saved entries. In v4, the plugin is working around drafts. Keep in mind, that
drafts might disappear, when saved or discarded (Copy&Paste).

## Support my work

PayPal: https://www.paypal.com/donate/?hosted_button_id=3WDU85HZCKMPA

Buy me a coffee: https://buymeacoffee.com/vandres

## Supporter

1. [Ambition Creative](https://www.ambitioncreative.co.uk/): Support for cards 
