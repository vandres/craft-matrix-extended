# Development

## `composer.json`

```json
"require": {
  "vandres/craft-matrix-extended": "*",
}
```
```json
"minimum-stability": "dev",
```
```json
"repositories": [
    {
        "type": "path",
        "url": "plugins/matrix-extended"
    },
    {
        "type": "composer",
        "url": "https://composer.craftcms.com",
        "canonical": false
    }
]
```

## `.env`

```php
# Plugin development
VANDRES_PLUGIN_DEVSERVER=1
```
