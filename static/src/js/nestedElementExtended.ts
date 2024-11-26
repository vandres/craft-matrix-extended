(function (window: any) {
    const {Craft, Garnish, $} = window;
    if (!Craft || !Garnish || !$) {
        return;
    }

    /**
     * @see https://github.com/craftcms/cms/blob/5.x/src/web/assets/cp/src/js/NestedElementManager.js
     */
    Craft.NestedElementExtended = Garnish.Base.extend({
        settings: {}, childParent: {}, entryReference: undefined,

        init: function (config: { settings: any, childParent: any, entryReference: any }) {
            const self = this;

            this.settings = config.settings || {};
            this.childParent = config.childParent || {};
            this.entryReference = config.entryReference || undefined;

            if (!Garnish.DisclosureMenu || !Craft.NestedElementManager) {
                return;
            }

            // for now
            return;

            const nestedInitFn = Craft.NestedElementManager.prototype.init;
            Craft.NestedElementManager.prototype.init = function (...args: any[]) {
                nestedInitFn.apply(this, args);
                if (!self.settings.experimentalFeatures) {
                    return;
                }

                const parent = this;
                if (parent.settings.mode !== 'cards' || !parent.settings.canCreate) {
                    return;
                }

                console.log('NestedElementManager');

                console.log(parent.settings);
                console.log(self.settings);

                const disclosureMenuShowFn = Garnish.DisclosureMenu.prototype.show;
                Garnish.DisclosureMenu.prototype.show = function (...args: any[]) {
                    self.initDisclosureMenu(this);
                    disclosureMenuShowFn.apply(this, args);
                };

            };
        },

        initDisclosureMenu(disclosureMenu: any) {
            console.log('initDisclosureMenu');
            const {$trigger, $container} = disclosureMenu;
            if (!$trigger || !$container || !$trigger.hasClass('action-btn')) {
                return;
            }

            const $element = $trigger.closest('.card-actions').parent('.card-actions-container').parent('.card');
            if (!$element.length) {
                return;
            }

            const {typeId, id} = $element.data();
            if (!typeId || !id) {
                return;
            }

            console.log($element.data());
        },
    });
})(window);
