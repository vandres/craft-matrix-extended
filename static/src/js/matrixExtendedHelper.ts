(function (window: any) {
    const {Craft, Garnish, $} = window;
    if (!Craft || !Garnish || !$) {
        return;
    }

    Craft.MatrixExtendedHelper = Garnish.Base.extend({
        settings: {}, childParent: {}, entryReference: undefined,

        init: function (config: { settings: any, childParent: any, entryReference: any }) {
            this.settings = config.settings || {};
            this.childParent = config.childParent || {};
            this.entryReference = config.entryReference || undefined;

            if (!Garnish.DisclosureMenu || !Craft.MatrixInput) {
                return;
            }
        },

        getEntryReference: function () {
            return this.entryReference;
        },

        setEntryReference: function (entryReference: any) {
            this.entryReference = entryReference;
        },

        isEntryReferenceAllowed: function (fieldId: number): boolean {
            if (!this.childParent) {
                return false;
            }

            if (!(this.childParent[this.entryReference.entryTypeId] || []).includes(fieldId)) {
                return false;
            }

            return true;
        }
    });
})(window);
