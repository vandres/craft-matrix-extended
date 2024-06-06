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
            this.settings = config.settings || {};
            this.childParent = config.childParent || {};
            this.entryReference = config.entryReference || undefined;

            if (!Garnish.DisclosureMenu || !Craft.NestedElementManager) {
                return;
            }
        },
    });
})(window);
