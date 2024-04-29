(function (window) {
    const {Craft, Garnish, $} = window;

    if (!Craft || !Garnish || !$) {
        return;
    }

    Craft.MatrixExtension = Garnish.Base.extend({
        init: function () {
            const _this = this;

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

        duplicateEntry: async function (typeId, entry, matrix) {
            console.log('duplicateEntry');
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
                if (typeof autofocus === 'undefined' || autofocus) {
                    // Scroll to the entry
                    Garnish.scrollContainerToElement($entry);
                    // Focus on the first focusable element
                    $entry.find('.flex-fields :focusable').first().trigger('focus');
                }

                // Resume the element editor
                matrix.elementEditor?.resume();
            });

            matrix.addingEntry = false;
            entry.actionDisclosure.hide();
        },
    });
})(window);
