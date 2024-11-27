(function (window: any) {
    const {Craft, Garnish, $} = window;
    if (!Craft || !Garnish || !$) {
        return;
    }

    /**
     * @see https://github.com/craftcms/cms/blob/5.x/src/web/assets/cp/src/js/NestedElementManager.js
     */
    Craft.NestedElementExtended = Garnish.Base.extend({
        settings: {}, childParent: {}, helper: undefined,

        init: function (config: { settings: any, childParent: any }, helper: any) {
            const self = this;

            this.settings = config.settings || {};
            this.childParent = config.childParent || {};
            this.helper = helper;

            if (!Garnish.DisclosureMenu || !Craft.NestedElementManager) {
                return;
            }

            const nestedInitFn = Craft.NestedElementManager.prototype.init;
            Craft.NestedElementManager.prototype.init = function (...args: any[]) {
                nestedInitFn.apply(this, args);
            };

            const disclosureMenuShowFn = Garnish.DisclosureMenu.prototype.show;
            Garnish.DisclosureMenu.prototype.show = function (...args: any[]) {
                self.initDisclosureMenu(this);
                disclosureMenuShowFn.apply(this, args);
            };

            const disclosureMenuInitFn = Garnish.DisclosureMenu.prototype.init;
            Garnish.DisclosureMenu.prototype.init = function (...args: any[]) {
                disclosureMenuInitFn.apply(this, args);
                self.initAddButtonMenu(this);
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
                this.checkPaste($container, $element, nem);
                this.checkDuplicate($container, nem);
                // this.checkAdd($container, matrix);
                return;
            }
            disclosureMenu._hasNestedElementExtensionButtonsInitialized = true;

            this.addMenu($container, typeId, $element, nem);
        },

        initAddButtonMenu(disclosureMenu: any) {
            if (!this.settings.expandMenu) {
                return;
            }

            const {$trigger, $container} = disclosureMenu;
            const $parent = $trigger.parent();
            const $wrapper = $trigger.closest('.nested-element-cards');
            const nem = $wrapper.data('nestedElementManager');
            if (!nem || !$trigger || !$container || $parent.hasClass('card-actions') || !$wrapper.attr('id')) {
                return;
            }

            if (!Array.isArray(nem.settings.createAttributes)) {
                return;
            }

            if ($trigger._hasNestedElementExtensionButtonsInitialized) {
                return;
            }
            $trigger.hide();
            $trigger._hasNestedElementExtensionButtonsInitialized = true;

            const $buttonContainer = $('<div class="buttons matrix-extended-buttons"></div>');

            const $createBtn = Craft.ui
                .createButton({
                    label: nem.settings.createButtonLabel,
                    spinner: true,
                })
                .addClass('add icon disabled');

            const $btnContainer = $('<div/>').appendTo($container);
            $createBtn.addClass('dashed').appendTo($btnContainer);

            const createMenuId = `menu-${Math.floor(Math.random() * 1000000)}`;
            const $menu = $('<div/>', {
                id: createMenuId,
                class: 'menu menu--disclosure',
            }).insertAfter($createBtn);
            const $ul = $('<ul/>').appendTo($menu);
            for (const type of nem.settings.createAttributes) {
                const $li = $('<li/>').appendTo($ul);
                let buttonHtml = '';
                if (type.icon) {
                    const $icon = $(`<span class="icon">${type.icon}</span>`);
                    if (type.color) {
                        $icon.addClass(type.color);
                    }
                    buttonHtml += $icon.prop('outerHTML');
                }
                buttonHtml += `<span class="label">${type.label}</span>`;
                const $button = $('<button/>', {
                    type: 'button',
                    class: 'menu-item',
                    'data-type': this.helper.getEntryTypeById(type.attributes.typeId).name,
                    html: buttonHtml,
                }).appendTo($li);
                this.addListener($button, 'activate', (ev: any) => {
                    ev.preventDefault();
                    $createBtn.data('disclosureMenu').hide();
                    nem.createElement(type.attributes);
                });
            }
            $createBtn
                .attr('aria-controls', createMenuId)
                .attr('data-disclosure-trigger', 'true')
                .addClass('menubtn')
                .disclosureMenu();

            const $actionButtons = $createBtn
                .disclosureMenu()
                .data('disclosureMenu')
                .$container.find('button')
                .clone()
                .off()
                .on('activate', async (ev: any) => {
                    const $target = $(ev.currentTarget);
                    const $button = $createBtn
                        .disclosureMenu()
                        .data('disclosureMenu')
                        .$container.find('button').filter((_: any, x: any) => $(x).data('type') === $target.data('type'));
                    $button.trigger('activate');
                });

            const id = $wrapper.attr('id');
            this.buildGroupedMenu($buttonContainer, $actionButtons, $trigger, id);

            $buttonContainer.appendTo($parent);
        },

        buildGroupedMenu: function ($buttonContainer: any, $actionButtons: any, $actionBtn: any, id: any, above = false) {
            let fieldIndex: string = id.replace(/.*fields-/, '');
             fieldIndex = fieldIndex.replace(/-element-index-.*/, '');

            let $unused = $actionButtons;
            if (!this.settings.fields) {
                const $actionButtonContainer = $('<div class="btngroup matrix-extended-btngroup"></div>')
                $unused.first().addClass('add icon');
                $unused.addClass('btn dashed');
                $actionButtonContainer.append($unused);
                $buttonContainer.append($actionButtonContainer)
                return;
            }

            if (!this.settings.fields[fieldIndex]) {
                const $actionButtonContainer = $('<div class="btngroup matrix-extended-btngroup"></div>')
                $unused.first().addClass('add icon');
                $unused.addClass('btn dashed');
                $actionButtonContainer.append($unused);
                $buttonContainer.append($actionButtonContainer)
                return;
            }

            const fieldGroup: Record<string, { groups: any, oneLiner: boolean }> = this.settings.fields[fieldIndex];
            if (fieldGroup.oneLiner) {
                $buttonContainer.addClass('one-line');
            }
            for (const [index, group] of Object.entries(fieldGroup.groups)) {
                $(`#matrix-extended-menu-${id}-${index}${above ? '-above' : ''}`).remove();

                const $groupedMenuButton = Craft.ui
                    .createButton({
                        label: group.label, spinner: true,
                    })
                    .addClass('btn menubtn dashed add icon')
                    .attr('aria-controls', `matrix-extended-menu-${id}-${index}${above ? '-above' : ''}`)
                    .appendTo($buttonContainer);
                const $menuContainer = $(`<div class="menu menu--disclosure" id="matrix-extended-menu-${id}-${index}${above ? '-above' : ''}">`);
                const $menu = $('<ul></ul>');

                $menuContainer.append($menu);
                $(document.body).append($menuContainer);
                const disclosure = new Garnish.DisclosureMenu($groupedMenuButton);

                for (const type of group.types) {
                    const $li = $(`<li></li>`);
                    const $button = $actionButtons.filter((_: any, x: any) => $(x).data('type') === type);
                    $unused = $unused.filter((_: any, x: any) => $(x).data('type') !== type);
                    if (!$button.length) {
                        console.warn(`Type ${type} not found in group ${id}`)
                        continue;
                    }
                    $li.append($button);
                    $menu.append($li);
                    $button.on('activate', () => {
                        if (!above) {
                            disclosure.hide();
                            return;
                        }
                        $menuContainer.remove();
                        disclosure.destroy();
                    });
                }
            }

            if (!$unused.length) {
                return;
            }

            if (this.settings.expandUngrouped) {
                const $actionButtonContainer = $('<div class="btngroup matrix-extended-btngroup"></div>')
                $unused.first().addClass('add icon');
                $unused.addClass('btn dashed');
                $actionButtonContainer.append($unused);
                if (this.settings.ungroupedPosition === 'end') {
                    $buttonContainer.append($actionButtonContainer)
                } else {
                    $buttonContainer.prepend($actionButtonContainer)
                }
                return;
            }

            $(`#matrix-extended-menu-${id}-others${above ? '-above' : ''}`).remove();
            const $groupedMenuButton = Craft.ui
                .createButton({
                    label: $actionBtn.find('.label').text(), spinner: true,
                })
                .addClass('btn menubtn dashed add icon')
                .attr('aria-controls', `matrix-extended-menu-${id}-others${above ? '-above' : ''}`);

            if (this.settings.ungroupedPosition === 'end') {
                $groupedMenuButton.appendTo($buttonContainer);
            } else {
                $groupedMenuButton.prependTo($buttonContainer);
            }

            const $menuContainer = $(`<div class="menu menu--disclosure" id="matrix-extended-menu-${id}-others${above ? '-above' : ''}">`);
            const $menu = $('<ul></ul>');

            $menuContainer.append($menu);
            $(document.body).append($menuContainer);
            const disclosure = new Garnish.DisclosureMenu($groupedMenuButton);

            for (const button of $unused) {
                const $li = $(`<li></li>`);
                const $button = $(button);
                $li.append($button);
                $menu.append($li);
                $button.on('activate', () => {
                    if (!above) {
                        disclosure.hide();
                        return;
                    }
                    $menuContainer.remove();
                    disclosure.destroy();
                })
            }
        },

        addMenu: function ($container: any, typeId: any, $element: any, nem: any) {
            const $menu = $('<ul class="matrix-extended"></ul>');
            const $hr = $('<hr class="padded">');

            // this.addAddBlockButton($menu, typeId, entry, matrix);
            this.addDuplicateButton($container, $menu, typeId, $element, nem);
            this.addCopyButton($container, $menu, typeId, $element, nem);
            this.addPasteButton($container, $menu, typeId, $element, nem);

            $menu.insertBefore($container.find('ul').eq(0));
            $hr.insertAfter($menu);

            this.checkPaste($container, $element, nem);
            this.checkDuplicate($container, nem);
            // this.checkAdd($container, nem);
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

        addCopyButton: function ($container: any, $menu: any, typeId: any, $element: any, nem: any) {
            const $copyButton = $(`<li>
                    <button class="menu-item" data-action="copy" tabindex="0">
                        <span class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M280 64h40c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128C0 92.7 28.7 64 64 64h40 9.6C121 27.5 153.3 0 192 0s71 27.5 78.4 64H280zM64 112c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16H320c8.8 0 16-7.2 16-16V128c0-8.8-7.2-16-16-16H304v24c0 13.3-10.7 24-24 24H192 104c-13.3 0-24-10.7-24-24V112H64zm128-8a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"/></svg>
                        </span><span class="menu-item-label">${Craft.t('matrix-extended', 'Copy')}</span>
                    </button>
                </li>`);
            $menu.append($copyButton);

            $copyButton.find('button').on('click', () => {
                this.copyEntry($container, $menu, typeId, $element, nem);
            });
        },

        copyEntry: async function ($container: any, $menu: any, typeId: any, $element: any, nem: any) {
            try {
                const {data} = await Craft.sendActionRequest('POST', 'matrix-extended/nested-element-extended/copy-entry', {
                    data: {
                        fieldId: $element.data().fieldId,
                        entryId: $element.data().id,
                        entryTypeId: typeId,
                        ownerId: nem.settings.ownerId,
                        ownerElementType: nem.settings.ownerElementType,
                        siteId: nem.settings.ownerSiteId,
                    },
                });

                this.helper.setEntryReference(data.entryReference);
                this.checkPaste($container, $element, nem);
                this.checkDuplicate($container, nem);
                // this.checkAdd($container, nem);
                await Craft.appendHeadHtml(data.headHtml);
                await Craft.appendBodyHtml(data.bodyHtml);

                this.addStatusMessage(Craft.t('matrix-extended', 'Entry reference copied'));
            } catch (error) {
                this.addStatusMessage(Craft.t('matrix-extended', 'There was an error copying the entry reference'), 'error');
            }
            $container.data('disclosureMenu').hide();
        },

        addPasteButton: function ($container: any, $menu: any, typeId: any, $element: any, nem: any) {
            const $pasteButton = $(`<li>
            <button class="menu-item" data-action="paste" tabindex="0"> 
                        <span class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M104.6 48H64C28.7 48 0 76.7 0 112V384c0 35.3 28.7 64 64 64h96V400H64c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H80c0 17.7 14.3 32 32 32h72.4C202 108.4 227.6 96 256 96h62c-7.1-27.6-32.2-48-62-48H215.4C211.6 20.9 188.2 0 160 0s-51.6 20.9-55.4 48zM144 56a16 16 0 1 1 32 0 16 16 0 1 1 -32 0zM448 464H256c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16l140.1 0L464 243.9V448c0 8.8-7.2 16-16 16zM256 512H448c35.3 0 64-28.7 64-64V243.9c0-12.7-5.1-24.9-14.1-33.9l-67.9-67.9c-9-9-21.2-14.1-33.9-14.1H256c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64z"/></svg>
                        </span><span class="menu-item-label">${Craft.t('matrix-extended', 'Paste')}</span>
                    </button>
                </li>`);
            $menu.append($pasteButton);

            $pasteButton.find('button').on('click', () => {
                this.pasteEntry($container, $menu, typeId, $element, nem);
            });
        },

        checkPaste: function ($container: any, $element: any, nem: any) {
            const $pasteButton = $container.find('button[data-action="paste"]');
            $pasteButton.disable();
            const $parent = $pasteButton.parent();
            $parent.attr('title', '');

            if (!this.helper.getEntryReference() || !this.helper.getEntryReference().entryTypeId) {
                $parent.attr('title', Craft.t('matrix-extended', 'There is nothing to paste.'));
                return;
            }

            if (!nem.canCreate()) {
                $parent.attr('title', Craft.t('matrix-extended', 'No more entries can be added.'));
                return;
            }

            if (!this.helper.isEntryReferenceAllowed($element.data().fieldId)) {
                $parent.attr('title', Craft.t('matrix-extended', 'The copied entry is not allowed here.'));
                return;
            }

            $pasteButton.enable();
        },

        pasteEntry: async function ($container: any, $menu: any, typeId: any, $element: any, nem: any) {
            if (!nem.canCreate()) {
                return;
            }

            try {
                await nem.markAsDirty();

                const {data} = await Craft.sendActionRequest('POST', 'matrix-extended/nested-element-extended/paste-entry', {
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
                this.addStatusMessage(Craft.t('matrix-extended', 'There was an error pasting the entry'), 'error');
            }

            $container.data('disclosureMenu').hide();
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
                                    ownerId: nem.settings.ownerId,
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
