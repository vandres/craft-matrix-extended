(function (window: any) {
    const {Craft, Garnish, $} = window;
    if (!Craft || !Garnish || !$) {
        return;
    }

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
