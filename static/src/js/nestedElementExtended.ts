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

            const disclosureMenuInitFn = Garnish.DisclosureMenu.prototype.init;
            Garnish.DisclosureMenu.prototype.init = function (...args: any[]) {
                disclosureMenuInitFn.apply(this, args);
                self.initAddButtonMenu(this);
            };
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
                switch (this.settings.ungroupedPosition) {
                    case 'start':
                        $buttonContainer.prepend($actionButtonContainer);
                        break;
                    case 'end':
                        $buttonContainer.append($actionButtonContainer)
                        break;
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

            switch (this.settings.ungroupedPosition) {
                case 'start':
                    $groupedMenuButton.prependTo($buttonContainer);
                    break;
                case 'end':
                    $groupedMenuButton.appendTo($buttonContainer);
                    break;
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
    });
})(window);
