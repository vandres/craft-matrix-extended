(function (window: any) {
    const {Craft, Garnish, $} = window;
    if (!Craft || !Garnish || !$) {
        return;
    }

    /**
     * @see https://github.com/craftcms/cms/blob/5.x/src/web/assets/matrix/src/MatrixInput.js
     * @todo check, that it only initializes on Inline Editable views
     */
    Craft.MatrixExtended = Garnish.Base.extend({
        settings: {}, childParent: {}, helper: undefined, itemDrag: undefined,

        init: function (config: { settings: any, childParent: any }, helper: any) {
            const self = this;
            this.settings = config.settings || {};
            this.childParent = config.childParent || {};
            this.helper = helper;

            if (!Garnish.DisclosureMenu || !Craft.MatrixInput) {
                return;
            }

            const disclosureMenuShowFn = Garnish.DisclosureMenu.prototype.show;
            Garnish.DisclosureMenu.prototype.show = function (...args: any[]) {
                self.initDisclosureMenu(this);
                disclosureMenuShowFn.apply(this, args);
            };

            const disclosureMenuInitFn = Garnish.DisclosureMenu.prototype.init;
            Garnish.DisclosureMenu.prototype.init = function (...args: any[]) {
                disclosureMenuInitFn.apply(this, args);
                self.initAddButtonMenu(this);
                self.prepareEntryDropZones();
            };

            const matrixUpdateAddEntryBtnFn = Craft.MatrixInput.prototype.updateAddEntryBtn;
            Craft.MatrixInput.prototype.updateAddEntryBtn = function (...args: any[]) {
                matrixUpdateAddEntryBtnFn.apply(this, args);
                self.checkAddBtn(this);
            };

            if (!this.settings.experimentalFeatures || !this.settings.enableDragDrop) {
                return;
            }

            const matrixInitFn = Craft.MatrixInput.prototype.init;
            Craft.MatrixInput.prototype.init = function (...args: any[]) {
                matrixInitFn.apply(this, args);
                this.entrySort.allowDragging = () => false;
                this.entrySort.destroy();
                self.prepareEntryDropZones();
            };

            Craft.MatrixInput.prototype.canAddMoreEntries = function () {
                return (
                    !this.maxEntries ||
                    this.$entriesContainer.children(':not(.matrix-extended-drop-target):not(.matrix-extended-buttons)').length < this.maxEntries
                );
            };

            this.itemDrag = new Garnish.DragDrop({
                activeDropTargetClass: 'active',
                minMouseDist: 10,
                hideDraggee: false,
                moveHelperToCursor: true,
                handle: (item: any) => $(item).find('> .actions > .move, > .titlebar'),
                filter: () => this.itemDrag.$targetItem.closest('.matrixblock'),
                dropTargets: () => {
                    if (!this.childParent) {
                        return [];
                    }

                    const {entry, typeId} = this.itemDrag.$draggee.closest('.matrixblock').data();
                    const matrix = entry.matrix;
                    if (!matrix || !typeId) {
                        return [];
                    }
                    // TODO check `canAddMore`, but only if drag and drop is between fields
                    // const $allDropTargets = $('.matrix-extended-drop-target').filter((_, x) => !!$(x).data('canAddMore'));
                    const $allDropTargets = $('.matrix-extended-drop-target')
                        .filter((_: any, x: any) => (this.childParent[typeId] || []).includes($(x).data('entryTypeId')));

                    return $allDropTargets.toArray().reverse();
                },
                onDragStart: () => {
                    Garnish.$bod.addClass('dragging');
                    this.itemDrag.$draggee.closest('.matrixblock').addClass('draggee');
                    this.$dropEntry = this.itemDrag.$draggee.data('entry').$container;
                    this.$pullBlock = this.$dropEntry.closest('.matrix-field');
                },
                // TODO find better way, like changing the owner. Currently clone & delete is used
                onDragStop: async () => {
                    this.itemDrag.$draggee.closest('.matrixblock').removeClass('draggee');
                    Garnish.$bod.removeClass('dragging');
                    if (!this.$dropEntry || !this.$pullBlock) {
                        return this.itemDrag.returnHelpersToDraggees();
                    }
                    const $dropEntry = this.$dropEntry;
                    const $dropTarget = this.itemDrag.$activeDropTarget;

                    if (!$dropEntry || !$dropTarget) {
                        return this.itemDrag.returnHelpersToDraggees();
                    }

                    let $relationEntry;
                    let relationPosition = 'insertBefore';
                    if ($dropTarget.data('position') === 'button') {
                        $relationEntry = $dropTarget.closest('.matrix-field').find('> .blocks');
                        relationPosition = 'appendTo';
                    } else {
                        $relationEntry = $dropTarget.next('.matrixblock');
                    }

                    const $pullBlock = this.$pullBlock;
                    const $dropBlock = $dropTarget.closest('.matrix-field');
                    if ($pullBlock.is($dropBlock)) {
                        if (relationPosition === 'appendTo') {
                            $dropEntry.appendTo($relationEntry);
                        } else {
                            $dropEntry.insertBefore($relationEntry);
                        }

                        // only update one block
                        $pullBlock.data('matrix').entrySelect.resetItemOrder();
                    } else {
                        const matrix = $dropBlock.data('matrix');
                        const matrix2 = $pullBlock.data('matrix');
                        const entry = $dropEntry.data('entry');
                        const typeId = $dropEntry.data('typeId');
                        await this.duplicateWithNewOwner($relationEntry, relationPosition, typeId, entry, matrix, matrix2)
                        // matrix.entrySelect.resetItemOrder();
                        // matrix2.entrySelect.resetItemOrder();
                    }

                    this.itemDrag.returnHelpersToDraggees();
                    this.prepareEntryDropZones();
                    this.$dropEntry = undefined;
                    this.$pullBlock = undefined;
                },
            });
        },

        prepareEntryDropZones() {
            if (!this.settings.experimentalFeatures || !this.settings.enableDragDrop) {
                return;
            }

            const $fields = $('.matrix-field');
            const $blocks = $fields.find('.matrixblock');

            $('.matrix-extended-drop-target').remove();
            for (const block of $blocks) {
                const $block = $(block);

                let $entryTypeId = null;
                const entry = $block.data('entry');
                if (!entry) {
                    return;
                }
                const matrix = entry.matrix;
                if (!matrix) {
                    return;
                }

                $entryTypeId = matrix.settings.fieldId;

                const $dropTargetBefore = $(`<div class="matrix-extended-drop-target" data-position="block"><div></div></div>`);
                $dropTargetBefore.data($block.data());
                $dropTargetBefore.data('entryTypeId', $entryTypeId);
                $block.before($dropTargetBefore);
            }

            const $buttons = $fields.find('> .buttons');
            for (const button of $buttons) {
                const $button = $(button);

                const matrix = $button.closest('.matrix-field').data('matrix');
                if (!matrix) {
                    continue;
                }

                const $dropTargetButton = $(`<div class="matrix-extended-drop-target" data-position="button"><div></div></div>`);
                $dropTargetButton.data('entryTypeId', matrix.settings.fieldId);
                $dropTargetButton.insertBefore($button);
            }

            this.itemDrag.removeAllItems();
            this.itemDrag.addItems($blocks);
            Garnish.$bod.addClass('matrix-extended-drag-drop');
        },

        initAddButtonMenu(disclosureMenu: any) {
            if (!this.settings.expandMenu) {
                return;
            }

            const {$trigger, $container} = disclosureMenu;
            const $parent = $trigger.parent();
            const $wrapper = $trigger.closest('.buttons').parent('.matrix-field');
            if (!$trigger || !$container || !$parent.hasClass('buttons') || !$wrapper.attr('id')) {
                return;
            }

            if ($trigger._hasMatrixExtensionButtonsInitialized) {
                return;
            }
            $trigger.hide();
            $trigger._hasMatrixExtensionButtonsInitialized = true;

            const $buttonContainer = $('<div class="buttons matrix-extended-buttons"></div>');
            const $actionButtons = $trigger
                .disclosureMenu()
                .data('disclosureMenu')
                .$container.find('button')
                .clone()
                .off()
                .on('activate', async (ev: any) => {
                    const $button = $container.find('button').filter((_: any, x: any) => $(x).data('type') === $(ev.currentTarget).data('type'));
                    $button.trigger('activate');
                });

            const id = $wrapper.attr('id');
            this.buildGroupedMenu($buttonContainer, $actionButtons, $trigger, id);

            $buttonContainer.appendTo($parent);
        },

        initDisclosureMenu(disclosureMenu: any) {
            const {$trigger, $container} = disclosureMenu;
            if (!$trigger || !$container || !$trigger.hasClass('action-btn')) {
                return;
            }
            const $element = $trigger.closest('.actions').parent('.matrixblock');
            if (!$element.length) {
                return;
            }
            const {typeId, entry} = $element.data();
            if (!typeId || !entry) {
                return;
            }

            const matrix = entry.matrix;
            if (!matrix) {
                return;
            }

            if (disclosureMenu._hasMatrixExtensionButtonsInitialized) {
                this.checkPaste($container, matrix);
                this.checkDuplicate($container, matrix);
                this.checkAdd($container, matrix);
                return;
            }
            disclosureMenu._hasMatrixExtensionButtonsInitialized = true;

            this.addMenu($container, typeId, entry, matrix);
        },

        pasteEntry: async function (_: any, typeId: any, entry: any, matrix: any) {
            if (matrix.addingEntry) {
                // only one new entry at a time
                return;
            }

            if (!matrix.canAddMoreEntries()) {
                matrix.updateStatusMessage();
                return;
            }

            matrix.addingEntry = true;

            if (matrix.elementEditor) {
                // First ensure we're working with drafts for all elements leading up
                // to this field’s element
                await matrix.elementEditor.setFormValue(matrix.settings.baseInputName, '*');
            }

            try {
                const entryId = matrix.elementEditor.getDraftElementId(entry.id);

                const {data} = await Craft.sendActionRequest('POST', 'matrix-extended/matrix-extended/paste-entry', {
                    data: {
                        fieldId: matrix.settings.fieldId,
                        entryId,
                        entryTypeId: typeId,
                        ownerId: matrix.settings.ownerId,
                        ownerElementType: matrix.settings.ownerElementType,
                        siteId: matrix.settings.siteId,
                        namespace: matrix.settings.namespace,
                        staticEntries: matrix.settings.staticEntries,
                    },
                });

                const $entry = $(data.blockHtml);

                // Pause the element editor
                matrix.elementEditor?.pause();
                $entry.insertAfter(entry.$container);

                matrix.trigger('entryAdded', {
                    $entry: $entry,
                });

                $entry.css('margin-bottom', '');
                Craft.initUiElements($entry.children('.fields'));
                await Craft.appendHeadHtml(data.headHtml);
                await Craft.appendBodyHtml(data.bodyHtml);
                new Craft.MatrixInput.Entry(matrix, $entry);
                matrix.entrySort.addItems($entry);
                matrix.entrySelect.addItems($entry);
                matrix.updateAddEntryBtn();

                // Animate the entry into position
                $entry.css(matrix.getHiddenEntryCss($entry)).velocity({
                    opacity: 1, 'margin-bottom': 10,
                }, 'fast',);

                Garnish.requestAnimationFrame(function () {
                    // Resume the element editor
                    matrix.elementEditor?.resume();
                });

            } catch (error) {
                this.addStatusMessage(Craft.t('matrix-extended', 'There was an error pasting the entry'), 'error');
            }

            matrix.addingEntry = false;
            entry.actionDisclosure.hide();
        },

        duplicateWithNewOwner: async function ($relationEntry: any, relationPosition: any, typeId: any, entry: any, matrix: any, matrix2: any) {
            if (matrix.addingEntry) {
                // only one new entry at a time
                return;
            }

            if (!matrix.canAddMoreEntries()) {
                matrix.updateStatusMessage();
                return;
            }

            matrix.addingEntry = true;

            if (matrix.elementEditor) {
                // First ensure we're working with drafts for all elements leading up
                // to this field’s element
                await matrix.elementEditor.setFormValue(matrix.settings.baseInputName, '*');
            }

            try {
                const entryId = matrix.elementEditor.getDraftElementId(entry.id);

                const {data} = await Craft.sendActionRequest('POST', 'matrix-extended/matrix-extended/duplicate-entry-with-new-owner', {
                    data: {
                        fieldId: matrix.settings.fieldId,
                        entryId,
                        entryTypeId: typeId,
                        ownerId: matrix.settings.ownerId,
                        ownerElementType: matrix.settings.ownerElementType,
                        siteId: matrix.settings.siteId,
                        namespace: matrix.settings.namespace,
                        staticEntries: matrix.settings.staticEntries,
                    },
                });

                const $entry = $(data.blockHtml);

                // Pause the element editor
                matrix.elementEditor?.pause();

                if (relationPosition === 'appendTo') {
                    $entry.appendTo($relationEntry);
                } else {
                    $entry.insertBefore($relationEntry);
                }
                entry.$container.hide();

                matrix.trigger('entryAdded', {
                    $entry: $entry,
                });

                $entry.css('margin-bottom', '');
                Craft.initUiElements($entry.children('.fields'));
                await Craft.appendHeadHtml(data.headHtml);
                await Craft.appendBodyHtml(data.bodyHtml);
                new Craft.MatrixInput.Entry(matrix, $entry);
                matrix.entrySort.addItems($entry);
                matrix.entrySelect.addItems($entry);
                matrix.updateAddEntryBtn();

                // Animate the entry into position
                $entry.css(matrix.getHiddenEntryCss($entry)).velocity({
                    opacity: 1, 'margin-bottom': 10,
                }, 'fast',);

                Garnish.requestAnimationFrame(function () {
                    // Resume the element editor
                    matrix.elementEditor?.resume();
                    entry.selfDestruct();
                });
            } catch (error) {
                this.addStatusMessage(Craft.t('matrix-extended', 'There was an error dropping the entry'), 'error');
            }

            matrix.addingEntry = false;
            entry.actionDisclosure.hide();
        },

        copyEntry: async function ($menu: any, typeId: any, entry: any, matrix: any) {
            try {
                const entryId = matrix.elementEditor.getDraftElementId(entry.id);

                const {data} = await Craft.sendActionRequest('POST', 'matrix-extended/matrix-extended/copy-entry', {
                    data: {
                        fieldId: matrix.settings.fieldId,
                        entryId,
                        entryTypeId: typeId,
                        ownerId: matrix.settings.ownerId,
                        ownerElementType: matrix.settings.ownerElementType,
                        siteId: matrix.settings.siteId,
                        namespace: matrix.settings.namespace,
                        staticEntries: matrix.settings.staticEntries,
                    },
                });

                this.helper.setEntryReference(data.entryReference);
                this.checkPaste($menu, matrix);
                this.checkDuplicate($menu, matrix);
                this.checkAdd($menu, matrix);
                await Craft.appendHeadHtml(data.headHtml);
                await Craft.appendBodyHtml(data.bodyHtml);

                this.addStatusMessage(Craft.t('matrix-extended', 'Entry reference copied'));
            } catch (error) {
                this.addStatusMessage(Craft.t('matrix-extended', 'There was an error copying the entry reference'), 'error');
            }
            entry.actionDisclosure.hide();
        },

        duplicateEntry: async function (_: any, typeId: any, entry: any, matrix: any) {
            if (matrix.addingEntry) {
                // only one new entry at a time
                return;
            }

            if (!matrix.canAddMoreEntries()) {
                matrix.updateStatusMessage();
                return;
            }

            matrix.addingEntry = true;

            if (matrix.elementEditor) {
                // First ensure we're working with drafts for all elements leading up
                // to this field’s element
                await matrix.elementEditor.setFormValue(matrix.settings.baseInputName, '*');
            }

            const entryId = matrix.elementEditor.getDraftElementId(entry.id);

            try {
                const {data} = await Craft.sendActionRequest('POST', 'matrix-extended/matrix-extended/duplicate-entry', {
                    data: {
                        fieldId: matrix.settings.fieldId,
                        entryId,
                        entryTypeId: typeId,
                        ownerId: matrix.settings.ownerId,
                        ownerElementType: matrix.settings.ownerElementType,
                        siteId: matrix.settings.siteId,
                        namespace: matrix.settings.namespace,
                        staticEntries: matrix.settings.staticEntries,
                    },
                });

                const $entry = $(data.blockHtml);

                // Pause the element editor
                matrix.elementEditor?.pause();
                $entry.insertAfter(entry.$container);

                matrix.trigger('entryAdded', {
                    $entry: $entry,
                });

                $entry.css('margin-bottom', '');
                Craft.initUiElements($entry.children('.fields'));
                await Craft.appendHeadHtml(data.headHtml);
                await Craft.appendBodyHtml(data.bodyHtml);
                new Craft.MatrixInput.Entry(matrix, $entry);
                matrix.entrySort.addItems($entry);
                matrix.entrySelect.addItems($entry);
                matrix.updateAddEntryBtn();

                // Animate the entry into position
                $entry.css(matrix.getHiddenEntryCss($entry)).velocity({
                    opacity: 1, 'margin-bottom': 10,
                }, 'fast',);

                Garnish.requestAnimationFrame(function () {
                    // Resume the element editor
                    matrix.elementEditor?.resume();
                });
            } catch (error) {
                this.addStatusMessage(Craft.t('matrix-extended', 'There was an error duplicating the entry'), 'error');
            }

            matrix.addingEntry = false;
            entry.actionDisclosure.hide();
        },

        addMenu: function ($container: any, typeId: any, entry: any, matrix: any) {
            const $menu = $('<ul class="matrix-extended"></ul>');
            const $hr = $('<hr class="padded">');

            this.addAddBlockButton($menu, typeId, entry, matrix);
            this.addDuplicateButton($menu, typeId, entry, matrix);
            this.addCopyButton($menu, typeId, entry, matrix);
            this.addPasteButton($menu, typeId, entry, matrix);
            this.addDeleteButton($menu, entry);
            this.checkPaste($menu, matrix);
            this.checkDuplicate($menu, matrix);
            this.checkAdd($menu, matrix);

            $menu.insertBefore($container.find('ul').eq(0));
            $hr.insertAfter($menu);

            if (this.settings.removeEntryTypesFromDiscloseMenu) {
                const $addButtonContainer = $container.find('[data-action="add"]').parent().parent();
                $addButtonContainer.prev().remove();
                $addButtonContainer.remove();
            }
        },

        addPasteButton: function ($menu: any, typeId: any, entry: any, matrix: any) {
            if (!this.settings.enableCopyPaste) {
                return;
            }

            const $pasteButton = $(`<li>
            <button class="menu-item" data-action="paste" tabindex="0"> 
                        <span class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M104.6 48H64C28.7 48 0 76.7 0 112V384c0 35.3 28.7 64 64 64h96V400H64c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H80c0 17.7 14.3 32 32 32h72.4C202 108.4 227.6 96 256 96h62c-7.1-27.6-32.2-48-62-48H215.4C211.6 20.9 188.2 0 160 0s-51.6 20.9-55.4 48zM144 56a16 16 0 1 1 32 0 16 16 0 1 1 -32 0zM448 464H256c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16l140.1 0L464 243.9V448c0 8.8-7.2 16-16 16zM256 512H448c35.3 0 64-28.7 64-64V243.9c0-12.7-5.1-24.9-14.1-33.9l-67.9-67.9c-9-9-21.2-14.1-33.9-14.1H256c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64z"/></svg>
                        </span><span class="menu-item-label">${Craft.t('matrix-extended', 'Paste')}</span>
                    </button>
                </li>`);
            $menu.append($pasteButton);

            $pasteButton.find('button').on('click', () => {
                this.pasteEntry($menu, typeId, entry, matrix);
            });
        },

        addAddBlockButton: function ($menu: any, _: any, entry: any, matrix: any) {
            if (!this.settings.enableAddBlockAbove) {
                return;
            }

            if (!matrix.$addEntryMenuBtn.length && !matrix.$addEntryBtn.length) {
                return;
            }

            const $addBlockButton = $(`<li>
                    <button class="menu-item" data-action="add-block" tabindex="0">
                        <span class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M64 80c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V96c0-8.8-7.2-16-16-16H64zM0 96C0 60.7 28.7 32 64 32H384c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM200 344V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H248v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/></svg>
                        </span><span class="menu-item-label">${Craft.t('matrix-extended', 'Add block above')}</span>
                    </button>
                </li>`);
            $menu.append($addBlockButton);

            $addBlockButton.find('button').on('click', () => {
                const id = matrix.id;

                $('.matrix-extended-buttons-above').remove();
                $(`#matrix-extended-menu-${id}-all`).remove();

                const $buttonContainer = $('<div class="buttons matrix-extended-buttons matrix-extended-buttons-above"></div>');
                const $actionButtons =
                    matrix.$addEntryMenuBtn.length
                        ? matrix.$addEntryMenuBtn.data('disclosureMenu').$container.find('button').clone().off()
                        : matrix.$addEntryBtn.clone().off();

                const $clone = Craft.ui
                    .createButton({
                        label: matrix.$addEntryMenuBtn.find('.label').text(), spinner: true,
                    })
                    .addClass('btn menubtn dashed add icon')
                    .attr('aria-controls', `matrix-extended-menu-${id}-all`);

                const $menuContainer = $(`<div class="menu menu--disclosure" id="matrix-extended-menu-${id}-all">`);
                const $menu = $('<ul></ul>');

                $menuContainer.append($menu);
                $(document.body).append($menuContainer);
                const disclosure = new Garnish.DisclosureMenu($clone);

                for (const button of $actionButtons) {
                    const $li = $(`<li></li>`);
                    const $button = $(button);
                    $li.append($button)
                    $menu.append($li);
                }

                $actionButtons.on('activate', async (ev: any) => {
                    // only allow activation logic on "super" disclosure menu
                    if (!$(ev.currentTarget).closest(`#matrix-extended-menu-${id}-all`).length) {
                        return;
                    }

                    $clone.addClass('loading');

                    try {
                        await matrix.addEntry($(ev.currentTarget).data('type'), entry.$container[0].checkVisibility() ? entry.$container : undefined);
                    } finally {
                        disclosure.hide();
                        $clone.remove();
                        $menuContainer.remove();
                        $buttonContainer.remove();
                    }
                });

                if (this.settings.expandMenu) {
                    const $container = $clone.data('disclosureMenu').$container;
                    const $actionButtons = $container.find('button').clone(true, true);
                    this.buildGroupedMenu($buttonContainer, $actionButtons, $clone, id, true);
                } else {
                    $buttonContainer.append($clone);
                }

                $buttonContainer.insertBefore(entry.$container);
                entry.actionDisclosure.hide();
            });
        },

        addCopyButton: function ($menu: any, typeId: any, entry: any, matrix: any) {
            if (!this.settings.enableCopyPaste) {
                return;
            }

            const $copyButton = $(`<li>
                    <button class="menu-item" data-action="copy" tabindex="0">
                        <span class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M280 64h40c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128C0 92.7 28.7 64 64 64h40 9.6C121 27.5 153.3 0 192 0s71 27.5 78.4 64H280zM64 112c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16H320c8.8 0 16-7.2 16-16V128c0-8.8-7.2-16-16-16H304v24c0 13.3-10.7 24-24 24H192 104c-13.3 0-24-10.7-24-24V112H64zm128-8a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"/></svg>
                        </span><span class="menu-item-label">${Craft.t('matrix-extended', 'Copy')}</span>
                    </button>
                </li>`);
            $menu.append($copyButton);

            $copyButton.find('button').on('click', () => {
                this.copyEntry($menu, typeId, entry, matrix);
            });
        },

        addDuplicateButton: function ($menu: any, typeId: any, entry: any, matrix: any) {
            if (!this.settings.enableDuplicate) {
                return;
            }

            const $duplicateButton = $(`<li>
                <button class="menu-item" data-action="duplicate" tabindex="0">
                    <span class="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M64 464H288c8.8 0 16-7.2 16-16V384h48v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h64v48H64c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16zM224 304H448c8.8 0 16-7.2 16-16V64c0-8.8-7.2-16-16-16H224c-8.8 0-16 7.2-16 16V288c0 8.8 7.2 16 16 16zm-64-16V64c0-35.3 28.7-64 64-64H448c35.3 0 64 28.7 64 64V288c0 35.3-28.7 64-64 64H224c-35.3 0-64-28.7-64-64z"/></svg>
                    </span><span class="menu-item-label">${Craft.t('matrix-extended', 'Duplicate')}</span>
                </button>
            </li>`);
            $menu.append($duplicateButton);

            $duplicateButton.find('button').on('click', () => {
                this.duplicateEntry($menu, typeId, entry, matrix);
            });
        },

        addDeleteButton: function ($menu: any, entry: any) {
            if (!this.settings.extraDeleteButton) {
                return;
            }

            const $deleteButton = $(`<li>
                <button class="menu-item error" data-action="delete" tabindex="0">
                    <span class="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>
                    </span><span class="menu-item-label">${Craft.t('matrix-extended', 'Delete')}</span>
                </button>
            </li>`);
            $menu.append($deleteButton);

            $deleteButton.find('button').on('click', function () {
                entry.selfDestruct();
                entry.actionDisclosure.hide();
            });
        },

        buildGroupedMenu: function ($buttonContainer: any, $actionButtons: any, $actionBtn: any, id: any, above = false) {
            const fieldIndex: string = id.replace(/.*fields-/, '');
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
                        $buttonContainer.append($actionButtonContainer);
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

        checkAdd: function ($container: any, matrix: any) {
            const $addButton = $container.find('button[data-action="add-block"]');
            $addButton.disable();
            const $parent = $addButton.parent();
            $parent.attr('title', '');

            if (!matrix.canAddMoreEntries()) {
                $parent.attr('title', Craft.t('matrix-extended', 'No more entries can be added.'));
                return;
            }

            $addButton.enable();
        },

        checkAddBtn: function (matrix: any) {
            if (!this.settings.expandMenu) {
                return;
            }

            const $btns = matrix.$container.find('> .blocks > .matrix-extended-buttons, > .buttons > .matrix-extended-buttons').find('button');
            $btns.disable();
            const $parent = $btns.parent();
            $parent.attr('title', '');

            if (!matrix.canAddMoreEntries()) {
                $parent.attr('title', Craft.t('matrix-extended', 'No more entries can be added.'));
                return;
            }

            $btns.enable();
        },

        checkDuplicate: function ($container: any, matrix: any) {
            const $duplicateButton = $container.find('button[data-action="duplicate"]');
            $duplicateButton.disable();
            const $parent = $duplicateButton.parent();
            $parent.attr('title', '');

            if (!matrix.canAddMoreEntries()) {
                $parent.attr('title', Craft.t('matrix-extended', 'No more entries can be added.'));
                return;
            }

            $duplicateButton.enable();
        },

        checkPaste: function ($container: any, matrix: any) {
            const $pasteButton = $container.find('button[data-action="paste"]');
            $pasteButton.disable();
            const $parent = $pasteButton.parent();
            $parent.attr('title', '');

            if (!this.helper.getEntryReference() || !this.helper.getEntryReference().entryTypeId) {
                $parent.attr('title', Craft.t('matrix-extended', 'There is nothing to paste.'));
                return;
            }

            if (!matrix.canAddMoreEntries()) {
                $parent.attr('title', Craft.t('matrix-extended', 'No more entries can be added.'));
                return;
            }

            if (!this.helper.isEntryReferenceAllowed(matrix.settings.fieldId)) {
                $parent.attr('title', Craft.t('matrix-extended', 'The copied entry is not allowed here.'));
                return;
            }

            $pasteButton.enable();
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
