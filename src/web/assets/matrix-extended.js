(function (window) {
    const {Craft, Garnish, $} = window;

    if (!Craft || !Garnish || !$) {
        return;
    }

    Craft.MatrixExtension = Garnish.Base.extend({
        settings: {},

        init: function (config) {
            const _this = this;
            this.settings = config.settings || {};

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
            const _this = this;

            if (disclosureMenu._hasMatrixExtensionButtonsInitialized) {
                return;
            }
            disclosureMenu._hasMatrixExtensionButtonsInitialized = true;
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

            // TODO only show paste, if there is something in the session and the entry type is allowed here
            if (this.settings.experimentalFeatures) {
                const $pasteButton = $(`<li>
                    <button class="menu-item" data-action="copy" tabindex="0">
                        <span class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M104.6 48H64C28.7 48 0 76.7 0 112V384c0 35.3 28.7 64 64 64h96V400H64c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H80c0 17.7 14.3 32 32 32h72.4C202 108.4 227.6 96 256 96h62c-7.1-27.6-32.2-48-62-48H215.4C211.6 20.9 188.2 0 160 0s-51.6 20.9-55.4 48zM144 56a16 16 0 1 1 32 0 16 16 0 1 1 -32 0zM448 464H256c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16l140.1 0L464 243.9V448c0 8.8-7.2 16-16 16zM256 512H448c35.3 0 64-28.7 64-64V243.9c0-12.7-5.1-24.9-14.1-33.9l-67.9-67.9c-9-9-21.2-14.1-33.9-14.1H256c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64z"/></svg>                    
                        </span><span class="menu-item-label">${Craft.t('app', 'Paste')}</span>
                    </button>
                </li>`);
                $container.find('ul').eq(0).prepend($pasteButton);

                $pasteButton.find('button').on('click', function () {
                    _this.pasteEntry(typeId, entry, matrix);
                });

                const $copyButton = $(`<li>
                    <button class="menu-item" data-action="copy" tabindex="0">
                        <span class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M280 64h40c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128C0 92.7 28.7 64 64 64h40 9.6C121 27.5 153.3 0 192 0s71 27.5 78.4 64H280zM64 112c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16H320c8.8 0 16-7.2 16-16V128c0-8.8-7.2-16-16-16H304v24c0 13.3-10.7 24-24 24H192 104c-13.3 0-24-10.7-24-24V112H64zm128-8a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"/></svg>
                        </span><span class="menu-item-label">${Craft.t('app', 'Copy')}</span>
                    </button>
                </li>`);
                $container.find('ul').eq(0).prepend($copyButton);

                $copyButton.find('button').on('click', function () {
                    _this.copyEntry(typeId, entry, matrix);
                });
            }

            const $duplicateButton = $(`<li>
                <button class="menu-item" data-action="duplicate" tabindex="0">
                    <span class="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M64 464H288c8.8 0 16-7.2 16-16V384h48v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h64v48H64c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16zM224 304H448c8.8 0 16-7.2 16-16V64c0-8.8-7.2-16-16-16H224c-8.8 0-16 7.2-16 16V288c0 8.8 7.2 16 16 16zm-64-16V64c0-35.3 28.7-64 64-64H448c35.3 0 64 28.7 64 64V288c0 35.3-28.7 64-64 64H224c-35.3 0-64-28.7-64-64z"/></svg>
                    </span><span class="menu-item-label">${Craft.t('app', 'Duplicate')}</span>
                </button>
            </li>`);
            $container.find('ul').eq(0).prepend($duplicateButton);

            $duplicateButton.find('button').on('click', function () {
                _this.duplicateEntry(typeId, entry, matrix);
            });
        },

        pasteEntry: async function (typeId, entry, matrix) {
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

            matrix.addingEntry = false;
            entry.actionDisclosure.hide();
        },

        copyEntry: async function (typeId, entry, matrix) {
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

                await Craft.appendHeadHtml(data.headHtml);
                await Craft.appendBodyHtml(data.bodyHtml);

                this.addStatusMessage(Craft.t('app', 'Entry reference copied'));
            } catch (error) {
                this.addStatusMessage(Craft.t('app', 'There was an error copying the entry reference'), 'error');
            }
            entry.actionDisclosure.hide();
        },

        duplicateEntry: async function (typeId, entry, matrix) {
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

            matrix.addingEntry = false;
            entry.actionDisclosure.hide();
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
