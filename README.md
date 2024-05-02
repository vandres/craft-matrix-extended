# Matrix Extended

Adds functionality to the native Matrix field type

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
    'experimentalFeatures' => true,
    'expandMenu' => true,
    'expandUngrouped' => false,
    'ungroupedPosition' => 'start',
    'fields' => [
        'dyncontent' => [ // matrix field name
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
- copy and paste an entry to another position in the same or another entry type (experimental, testing)
- copy and paste an entry to another section (experimental, testing)
- "Add Block Above" Neo-style (experimental, testing)
- Allow "Add Block Above" to be expanded via settings (experimental, testing)
  - ~~show as dropdown, if space is not enough~~ (not for now)
  - allow to group buttons (experimental, in progress)
    - by config (experimental, testing)
    - ~~by settings/backend module~~ (not for now)
- Replace "New Entry" with expanded logic (experimental, in progress)
- cut and paste an entry
  - easier than drag and drop implementation
  - "delete" only after paste
- drag and drop between entry types

## Support my work

PayPal: https://www.paypal.com/donate/?hosted_button_id=3WDU85HZCKMPA

Buy me a coffee: https://buymeacoffee.com/vandres
