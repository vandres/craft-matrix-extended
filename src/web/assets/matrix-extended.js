(function (window) {
    const {Craft, Garnish, $} = window;

    if (!Craft || !Garnish || !$) {
        return;
    }

    Craft.MatrixExtension = Garnish.Base.extend({
        settings: {},
        childParent: {},
        entryReference: undefined,

        init: function (config) {
            const _this = this;
            this.settings = config.settings || {};
            this.childParent = config.childParent || {};
            this.entryReference = config.entryReference || undefined;

            // Init disclosure menus
            if (!Garnish.DisclosureMenu) {
                return;
            }

            const disclosureMenuShowFn = Garnish.DisclosureMenu.prototype.show;
            Garnish.DisclosureMenu.prototype.show = function () {
                _this.initDisclosureMenu(this);
                disclosureMenuShowFn.apply(this, arguments);
            };
        },

        initDisclosureMenu(disclosureMenu) {
            const {$trigger, $container} = disclosureMenu;
            if (!$trigger || !$container || !$trigger.hasClass('action-btn')) {
                return;
            }
            const $element = $trigger.closest('.matrixblock,.element.card,.element.chip');
            if (!$element.length) {
                return;
            }
            const {typeId} = $element.data();
            if (!typeId) {
                return;
            }

            const entry = $element.data('entry');
            if (!entry) {
                return;
            }

            const matrix = entry.matrix;
            if (!matrix) {
                return;
            }

            if (disclosureMenu._hasMatrixExtensionButtonsInitialized) {
                this.checkPaste($container, typeId, entry, matrix);
                return;
            }
            disclosureMenu._hasMatrixExtensionButtonsInitialized = true;

            this.addMenu($container, typeId, entry, matrix);
        },

        pasteEntry: async function ($menu, typeId, entry, matrix) {
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
                await matrix.elementEditor.setFormValue(
                    matrix.settings.baseInputName,
                    '*'
                );
            }

            try {
                const {data} = await Craft.sendActionRequest(
                    'POST',
                    'matrix-extended/matrix-extended/paste-entry',
                    {
                        data: {
                            fieldId: matrix.settings.fieldId,
                            entryId: entry.id,
                            entryTypeId: typeId,
                            ownerId: matrix.settings.ownerId,
                            ownerElementType: matrix.settings.ownerElementType,
                            siteId: matrix.settings.siteId,
                            namespace: matrix.settings.namespace,
                        },
                    }
                );

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
                $entry.css(matrix.getHiddenEntryCss($entry)).velocity(
                    {
                        opacity: 1,
                        'margin-bottom': 10,
                    },
                    'fast',
                );

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

        copyEntry: async function ($menu, typeId, entry, matrix) {
            try {
                const {data} = await Craft.sendActionRequest(
                    'POST',
                    'matrix-extended/matrix-extended/copy-entry',
                    {
                        data: {
                            fieldId: matrix.settings.fieldId,
                            entryId: entry.id,
                            entryTypeId: typeId,
                            ownerId: matrix.settings.ownerId,
                            ownerElementType: matrix.settings.ownerElementType,
                            siteId: matrix.settings.siteId,
                            namespace: matrix.settings.namespace,
                        },
                    }
                );

                this.entryReference = data.entryReference;
                this.checkPaste($menu, typeId, entry, matrix);
                await Craft.appendHeadHtml(data.headHtml);
                await Craft.appendBodyHtml(data.bodyHtml);
                this._hasMatrixExtensionButtonsInitialized

                this.addStatusMessage(Craft.t('matrix-extended', 'Entry reference copied'));
            } catch (error) {
                this.addStatusMessage(Craft.t('matrix-extended', 'There was an error copying the entry reference'), 'error');
            }
            entry.actionDisclosure.hide();
        },

        duplicateEntry: async function ($menu, typeId, entry, matrix) {
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
                await matrix.elementEditor.setFormValue(
                    matrix.settings.baseInputName,
                    '*'
                );
            }

            try {
                const {data} = await Craft.sendActionRequest(
                    'POST',
                    'matrix-extended/matrix-extended/duplicate-entry',
                    {
                        data: {
                            fieldId: matrix.settings.fieldId,
                            entryId: entry.id,
                            entryTypeId: typeId,
                            ownerId: matrix.settings.ownerId,
                            ownerElementType: matrix.settings.ownerElementType,
                            siteId: matrix.settings.siteId,
                            namespace: matrix.settings.namespace,
                        },
                    }
                );

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
                $entry.css(matrix.getHiddenEntryCss($entry)).velocity(
                    {
                        opacity: 1,
                        'margin-bottom': 10,
                    },
                    'fast',
                );

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

        addMenu: function ($container, typeId, entry, matrix) {
            $menu = $('<ul class="matrix-extended"></ul>');
            $hr = $('<hr class="padded">');

            this.addAddBlockButton($menu, typeId, entry, matrix);
            this.addDuplicateButton($menu, typeId, entry, matrix);
            this.addCopyButton($menu, typeId, entry, matrix);
            this.addPasteButton($menu, typeId, entry, matrix);
            this.addDeleteButton($menu, typeId, entry, matrix);
            this.checkPaste($menu, typeId, entry, matrix);

            $menu.insertBefore($container.find('ul').eq(0));
            $hr.insertAfter($menu);
        },

        addPasteButton: function ($menu, typeId, entry, matrix) {
            if (!this.settings.experimentalFeatures) {
                return;
            }

            const _this = this;

            const $pasteButton = $(`<li>
            <button class="menu-item" data-action="paste" tabindex="0">
                        <span class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M104.6 48H64C28.7 48 0 76.7 0 112V384c0 35.3 28.7 64 64 64h96V400H64c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H80c0 17.7 14.3 32 32 32h72.4C202 108.4 227.6 96 256 96h62c-7.1-27.6-32.2-48-62-48H215.4C211.6 20.9 188.2 0 160 0s-51.6 20.9-55.4 48zM144 56a16 16 0 1 1 32 0 16 16 0 1 1 -32 0zM448 464H256c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16l140.1 0L464 243.9V448c0 8.8-7.2 16-16 16zM256 512H448c35.3 0 64-28.7 64-64V243.9c0-12.7-5.1-24.9-14.1-33.9l-67.9-67.9c-9-9-21.2-14.1-33.9-14.1H256c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64z"/></svg>                    
                        </span><span class="menu-item-label">${Craft.t('matrix-extended', 'Paste')}</span>
                    </button>
                </li>`);
            $menu.append($pasteButton);

            $pasteButton.find('button').on('click', function () {
                _this.pasteEntry($menu, typeId, entry, matrix);
            });
        },

        addAddBlockButton: function ($menu, typeId, entry, matrix) {
            if (!this.settings.experimentalFeatures) {
                return;
            }

            if (!matrix.$addEntryMenuBtn) {
                return;
            }

            const _this = this;

            const $addBlockButton = $(`<li>
                    <button class="menu-item" data-action="add-block" tabindex="0">
                        <span class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M64 80c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V96c0-8.8-7.2-16-16-16H64zM0 96C0 60.7 28.7 32 64 32H384c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM200 344V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H248v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/></svg>                        
                        </span><span class="menu-item-label">${Craft.t('matrix-extended', 'Add block above')}</span>
                    </button>
                </li>`);
            $menu.append($addBlockButton);

            $addBlockButton.find('button').on('click', function () {
                $('.matrix-extended-buttons').remove();

                $buttonContainer = $('<div class="buttons matrix-extended-buttons"></div>')
                $clone = matrix.$addEntryMenuBtn.clone();
                $clone
                    .disclosureMenu()
                    .data('disclosureMenu')
                    .$container
                    .find('button')
                    .off()
                    .on('activate', async (ev) => {
                        $clone.addClass('loading');
                        try {
                            await matrix.addEntry($(ev.currentTarget).data('type'), entry.$container);
                        } finally {
                            $clone.data('trigger').hide();
                            $buttonContainer.remove();
                        }
                    });

                if (_this.settings.expandMenu) {
                    const $container = $clone.data('disclosureMenu').$container;
                    const $actionButtons = $container.find('button');
                    $actionButtons.addClass('btn dashed');
                    const $actionButtonContainer = $('<div class="btngroup matrix-extended-btngroup"></div>')
                    $actionButtonContainer.append($actionButtons);
                    $buttonContainer.append($actionButtonContainer);
                } else {
                    $buttonContainer.append($clone);
                }

                $buttonContainer.insertBefore(entry.$container);
                entry.actionDisclosure.hide();
            });
        },

        addCopyButton: function ($menu, typeId, entry, matrix) {
            if (!this.settings.experimentalFeatures) {
                return;
            }

            const _this = this;

            const $copyButton = $(`<li>
                    <button class="menu-item" data-action="copy" tabindex="0">
                        <span class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M280 64h40c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128C0 92.7 28.7 64 64 64h40 9.6C121 27.5 153.3 0 192 0s71 27.5 78.4 64H280zM64 112c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16H320c8.8 0 16-7.2 16-16V128c0-8.8-7.2-16-16-16H304v24c0 13.3-10.7 24-24 24H192 104c-13.3 0-24-10.7-24-24V112H64zm128-8a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"/></svg>
                        </span><span class="menu-item-label">${Craft.t('matrix-extended', 'Copy')}</span>
                    </button>
                </li>`);
            $menu.append($copyButton);

            $copyButton.find('button').on('click', function () {
                _this.copyEntry($menu, typeId, entry, matrix);
            });
        },

        addDuplicateButton: function ($menu, typeId, entry, matrix) {
            const _this = this;

            const $duplicateButton = $(`<li>
                <button class="menu-item" data-action="duplicate" tabindex="0">
                    <span class="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M64 464H288c8.8 0 16-7.2 16-16V384h48v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h64v48H64c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16zM224 304H448c8.8 0 16-7.2 16-16V64c0-8.8-7.2-16-16-16H224c-8.8 0-16 7.2-16 16V288c0 8.8 7.2 16 16 16zm-64-16V64c0-35.3 28.7-64 64-64H448c35.3 0 64 28.7 64 64V288c0 35.3-28.7 64-64 64H224c-35.3 0-64-28.7-64-64z"/></svg>
                    </span><span class="menu-item-label">${Craft.t('matrix-extended', 'Duplicate')}</span>
                </button>
            </li>`);
            $menu.append($duplicateButton);

            $duplicateButton.find('button').on('click', function () {
                _this.duplicateEntry($menu, typeId, entry, matrix);
            });
        },

        addDeleteButton: function ($menu, typeId, entry, matrix) {
            const _this = this;

            const $duplicateButton = $(`<li>
                <button class="menu-item error" data-action="delete" tabindex="0">
                    <span class="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>
                    </span><span class="menu-item-label">${Craft.t('matrix-extended', 'Delete')}</span>
                </button>
            </li>`);
            $menu.append($duplicateButton);

            $duplicateButton.find('button').on('click', function () {
                entry.selfDestruct();
                entry.actionDisclosure.hide();
            });
        },

        checkPaste: function ($container, typeId, entry, matrix) {
            $pasteButton = $container.find('button[data-action="paste"]');
            $pasteButton.disable();
            $parent = $pasteButton.parent();
            $parent.attr('title', '');

            if (!this.entryReference || !this.entryReference.entryTypeId) {
                $parent.attr('title', Craft.t('matrix-extended', 'There is nothing to paste.'));
                return;
            }

            if (!this.childParent) {
                $parent.attr('title', Craft.t('matrix-extended', 'The copied entry is not allowed here.'));
                return;
            }

            if (!(this.childParent[this.entryReference.entryTypeId] || []).includes(matrix.settings.fieldId)) {
                $parent.attr('title', Craft.t('matrix-extended', 'The copied entry is not allowed here.'));
                return;
            }

            $pasteButton.enable();
        },

        addStatusMessage: function (message, type) {
            type = type || 'notice';

            if (type === 'notice') {
                Craft.cp.displayNotice(message);
            }

            if (type === 'error') {
                Craft.cp.displayError(message);
            }
        }
    });
})(window);
