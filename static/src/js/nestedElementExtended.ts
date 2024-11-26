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

            const nestedInitFn = Craft.NestedElementManager.prototype.init;
            Craft.NestedElementManager.prototype.init = function (...args: any[]) {
                nestedInitFn.apply(this, args);
                console.log('NestedElementExtended');
            };

            const disclosureMenuShowFn = Garnish.DisclosureMenu.prototype.show;
            Garnish.DisclosureMenu.prototype.show = function (...args: any[]) {
                self.initDisclosureMenu(this);
                disclosureMenuShowFn.apply(this, args);
            };
        },

        initDisclosureMenu(disclosureMenu: any) {
            if (!this.settings.experimentalFeatures) {
                return;
            }

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

            const $parent = $element.closest('.nested-element-cards');
            const nem = $parent.data('nestedElementManager');
            if (!nem) {
                return;
            }

            if (nem.settings.mode !== 'cards' || !nem.settings.canCreate) {
                return;
            }

            if (disclosureMenu._hasNestedElementExtensionButtonsInitialized) {
                // this.checkPaste($container, matrix);
                this.checkDuplicate($container, nem);
                // this.checkAdd($container, matrix);
                return;
            }
            disclosureMenu._hasNestedElementExtensionButtonsInitialized = true;

            this.addMenu($container, typeId, $element, nem);
        },

        addMenu: function ($container: any, typeId: any, $element: any, nem: any) {
            const $menu = $('<ul class="matrix-extended"></ul>');
            const $hr = $('<hr class="padded">');

            // this.addAddBlockButton($menu, typeId, entry, matrix);
            this.addDuplicateButton($container, $menu, typeId, $element, nem);
            // this.addCopyButton($menu, typeId, entry, matrix);
            // this.addPasteButton($menu, typeId, entry, matrix);
            // this.addDeleteButton($menu, entry);

            $menu.insertBefore($container.find('ul').eq(0));
            $hr.insertAfter($menu);

            // this.checkPaste($menu, matrix);
            this.checkDuplicate($container, nem);
            // this.checkAdd($menu, matrix);
        },

        addDuplicateButton: function ($container: any, $menu: any, typeId: any, $element: any, nem: any) {
            const $duplicateButton = $(`<li>
                <button class="menu-item" data-action="duplicate" tabindex="0">
                    <span class="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M64 464H288c8.8 0 16-7.2 16-16V384h48v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h64v48H64c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16zM224 304H448c8.8 0 16-7.2 16-16V64c0-8.8-7.2-16-16-16H224c-8.8 0-16 7.2-16 16V288c0 8.8 7.2 16 16 16zm-64-16V64c0-35.3 28.7-64 64-64H448c35.3 0 64 28.7 64 64V288c0 35.3-28.7 64-64 64H224c-35.3 0-64-28.7-64-64z"/></svg>
                    </span><span class="menu-item-label">${Craft.t('matrix-extended', 'Duplicate')}</span>
                </button>
            </li>`);
            $menu.append($duplicateButton);

            $duplicateButton.find('button').on('click', () => {
                this.duplicateEntry($container, $menu, typeId, $element, nem);
            });
        },

        duplicateEntry: async function ($container: any, $menu: any, typeId: any, $element: any, nem: any) {
            if (!nem.canCreate()) {
                return;
            }

            try {
                await nem.markAsDirty();

                const {data} = await Craft.sendActionRequest('POST', 'matrix-extended/nested-element-extended/duplicate-entry', {
                    data: {
                        fieldId: $element.data().fieldId,
                        entryId: $element.data().id,
                        entryTypeId: typeId,
                        ownerId: nem.settings.ownerId,
                        ownerElementType: nem.settings.ownerElementType,
                        siteId: nem.settings.ownerSiteId,
                    },
                });

                await this.addElementCard(data, nem, $element.data('id'));
            } catch (error) {
                this.addStatusMessage(Craft.t('matrix-extended', 'There was an error duplicating the entry'), 'error');
            }

            $container.data('disclosureMenu').hide();
        },

        checkDuplicate: function ($container: any, nem: any) {
            const $duplicateButton = $container.find('button[data-action="duplicate"]');
            $duplicateButton.disable();
            const $parent = $duplicateButton.parent();
            $parent.attr('title', '');

            if (!nem.canCreate()) {
                $parent.attr('title', Craft.t('matrix-extended', 'No more entries can be added.'));
                return;
            }

            $duplicateButton.enable();
        },

        /**
         * Copy of original method, to allow custom position in the DOM
         *
         * @see NestedElementManager.addElementCard(element)
         */
        async addElementCard(element: any, nem: any, insertAfter: number) {
            if (nem.$createBtn) {
                nem.$createBtn.addClass('loading');
            }

            let response;
            try {
                response = await Craft.sendActionRequest(
                    'POST',
                    'app/render-elements',
                    {
                        data: {
                            elements: [
                                {
                                    type: nem.elementType,
                                    id: element.id,
                                    siteId: element.siteId,
                                    instances: [
                                        {
                                            context: 'field',
                                            ui: 'card',
                                            sortable: nem.settings.sortable,
                                            showActionMenu: true,
                                        },
                                    ],
                                },
                            ],
                        },
                    }
                );
            } catch (e: any) {
                Craft.cp.displayError(e?.response?.data?.message);
                throw e?.response?.data?.message ?? e;
            } finally {
                if (nem.$createBtn) {
                    nem.$createBtn.removeClass('loading');
                }
            }

            if (!nem.$elements) {
                nem.initCards();
            }

            const $li = $('<li/>');
            const $card = $(response.data.elements[element.id][0]).appendTo($li);
            nem.$elements.find(`[data-id="${insertAfter}"`).parent().after($li);
            nem.initElement($card);
            await Craft.appendHeadHtml(response.data.headHtml);
            await Craft.appendBodyHtml(response.data.bodyHtml);
            Craft.cp.elementThumbLoader.load($card);
            nem.updateCreateBtn();

            return $card;
        },

        addStatusMessage: function (message: string, type: 'notice' | 'error' = 'notice') {
            if (type === 'notice') {
                Craft.cp.displayNotice(message);
            }

            if (type === 'error') {
                Craft.cp.displayError(message);
            }
        }
    });
})(window);
