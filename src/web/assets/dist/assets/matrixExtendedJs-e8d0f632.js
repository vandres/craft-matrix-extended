(function(I){const{Craft:d,Garnish:p,$:r}=I;!d||!p||!r||(d.MatrixExtended=p.Base.extend({settings:{},childParent:{},entryReference:void 0,itemDrag:void 0,init:function(a){const s=this;if(this.settings=a.settings||{},this.childParent=a.childParent||{},this.entryReference=a.entryReference||void 0,!p.DisclosureMenu)return;const i=p.DisclosureMenu.prototype.show;p.DisclosureMenu.prototype.show=function(...o){s.initDisclosureMenu(this),i.apply(this,o)};const t=p.DisclosureMenu.prototype.init;if(p.DisclosureMenu.prototype.init=function(...o){t.apply(this,o),s.initAddButtonMenu(this),s.prepareEntryDropZones()},!this.settings.experimentalFeatures||!this.settings.enableDragDrop)return;const e=d.MatrixInput.prototype.init;d.MatrixInput.prototype.init=function(...o){e.apply(this,o),this.entrySort.allowDragging=()=>!1,this.entrySort.destroy(),s.prepareEntryDropZones()},d.MatrixInput.prototype.canAddMoreEntries=function(){return!this.maxEntries||this.$entriesContainer.children(":not(.matrix-extended-drop-target)").length<this.maxEntries},this.itemDrag=new p.DragDrop({activeDropTargetClass:"active",minMouseDist:10,hideDraggee:!1,moveHelperToCursor:!0,handle:o=>r(o).find("> .actions > .move, > .titlebar"),filter:()=>this.itemDrag.$targetItem.closest(".matrixblock"),dropTargets:()=>{if(!this.childParent)return[];const{entry:o,typeId:n}=this.itemDrag.$draggee.closest(".matrixblock").data();return!o.matrix||!n?[]:r(".matrix-extended-drop-target").filter((m,g)=>(this.childParent[n]||[]).includes(r(g).data("entryTypeId"))).toArray().reverse()},onDragStart:()=>{p.$bod.addClass("dragging"),this.itemDrag.$draggee.closest(".matrixblock").addClass("draggee"),this.$dropEntry=this.itemDrag.$draggee.data("entry").$container,this.$pullBlock=this.$dropEntry.closest(".matrix-field")},onDragStop:async()=>{if(this.itemDrag.$draggee.closest(".matrixblock").removeClass("draggee"),!this.$dropEntry||!this.$pullBlock)return this.itemDrag.returnHelpersToDraggees();const o=this.$dropEntry,n=this.itemDrag.$activeDropTarget;if(!o||!n)return this.itemDrag.returnHelpersToDraggees();let l,c="insertBefore";n.data("position")==="button"?(l=n.closest(".matrix-field").find("> .blocks"),c="appendTo"):l=n.next(".matrixblock");const m=this.$pullBlock,g=n.closest(".matrix-field");if(m.is(g))c==="appendTo"?o.appendTo(l):o.insertBefore(l),m.data("matrix").entrySelect.resetItemOrder();else{const y=g.data("matrix"),u=m.data("matrix"),h=o.data("entry"),f=o.data("typeId");await this.duplicateWithNewOwner(l,c,f,h,y,u)}this.itemDrag.returnHelpersToDraggees(),this.prepareEntryDropZones(),p.$bod.removeClass("dragging"),this.$dropEntry=void 0,this.$pullBlock=void 0}})},prepareEntryDropZones(){if(!this.settings.experimentalFeatures||!this.settings.enableDragDrop)return;const a=r(".matrix-field"),s=a.find(".matrixblock");r(".matrix-extended-drop-target").remove();for(const t of s){const e=r(t);let o=null;const n=e.data("entry");if(!n)return;const l=n.matrix;if(!l)return;o=l.settings.fieldId;const c=r('<div class="matrix-extended-drop-target" data-position="block"><div></div></div>');c.data(e.data()),c.data("entryTypeId",o),e.before(c)}const i=a.find("> .buttons");for(const t of i){const e=r(t),o=e.closest(".matrix-field").data("matrix");if(!o)continue;const n=r('<div class="matrix-extended-drop-target" data-position="button"><div></div></div>');n.data("entryTypeId",o.settings.fieldId),n.insertBefore(e)}this.itemDrag.removeAllItems(),this.itemDrag.addItems(s),p.$bod.addClass("matrix-extended-drag-drop")},initAddButtonMenu(a){if(!this.settings.experimentalFeatures||!this.settings.expandMenu)return;const{$trigger:s,$container:i}=a,t=s.parent(),e=s.closest(".matrix-field");if(!s||!i||!t.hasClass("buttons")||!e.attr("id")||s._hasMatrixExtensionButtonsInitialized)return;s.hide(),s._hasMatrixExtensionButtonsInitialized=!0;const o=r('<div class="buttons matrix-extended-buttons"></div>'),n=s.disclosureMenu().data("disclosureMenu").$container.find("button").clone().off().on("activate",async c=>{i.find("button").filter((g,y)=>r(y).data("type")===r(c.currentTarget).data("type")).trigger("activate")}),l=e.attr("id");this.buildGroupedMenu(o,n,s,l),o.appendTo(t)},initDisclosureMenu(a){const{$trigger:s,$container:i}=a;if(!s||!i||!s.hasClass("action-btn"))return;const t=s.closest(".matrixblock");if(!t.length)return;const{typeId:e,entry:o}=t.data();if(!e||!o)return;const n=o.matrix;if(n){if(a._hasMatrixExtensionButtonsInitialized){this.checkPaste(i,n),this.checkDuplicate(i,n);return}a._hasMatrixExtensionButtonsInitialized=!0,this.addMenu(i,e,o,n)}},pasteEntry:async function(a,s,i,t){var e;if(!t.addingEntry){if(!t.canAddMoreEntries()){t.updateStatusMessage();return}t.addingEntry=!0,t.elementEditor&&await t.elementEditor.setFormValue(t.settings.baseInputName,"*");try{const{data:o}=await d.sendActionRequest("POST","matrix-extended/matrix-extended/paste-entry",{data:{fieldId:t.settings.fieldId,entryId:i.id,entryTypeId:s,ownerId:t.settings.ownerId,ownerElementType:t.settings.ownerElementType,siteId:t.settings.siteId,namespace:t.settings.namespace,staticEntries:t.settings.staticEntries}}),n=r(o.blockHtml);(e=t.elementEditor)==null||e.pause(),n.insertAfter(i.$container),t.trigger("entryAdded",{$entry:n}),n.css("margin-bottom",""),d.initUiElements(n.children(".fields")),await d.appendHeadHtml(o.headHtml),await d.appendBodyHtml(o.bodyHtml),new d.MatrixInput.Entry(t,n),t.entrySort.addItems(n),t.entrySelect.addItems(n),t.updateAddEntryBtn(),n.css(t.getHiddenEntryCss(n)).velocity({opacity:1,"margin-bottom":10},"fast"),p.requestAnimationFrame(function(){var l;(l=t.elementEditor)==null||l.resume()})}catch{this.addStatusMessage(d.t("matrix-extended","There was an error pasting the entry"),"error")}t.addingEntry=!1,i.actionDisclosure.hide()}},duplicateWithNewOwner:async function(a,s,i,t,e,o){var n;if(!e.addingEntry){if(!e.canAddMoreEntries()){e.updateStatusMessage();return}e.addingEntry=!0,e.elementEditor&&await e.elementEditor.setFormValue(e.settings.baseInputName,"*");try{const{data:l}=await d.sendActionRequest("POST","matrix-extended/matrix-extended/duplicate-entry-with-new-owner",{data:{fieldId:e.settings.fieldId,entryId:t.id,entryTypeId:i,ownerId:e.settings.ownerId,ownerElementType:e.settings.ownerElementType,siteId:e.settings.siteId,namespace:e.settings.namespace,staticEntries:e.settings.staticEntries}}),c=r(l.blockHtml);(n=e.elementEditor)==null||n.pause(),s==="appendTo"?c.appendTo(a):c.insertBefore(a),t.$container.hide(),e.trigger("entryAdded",{$entry:c}),c.css("margin-bottom",""),d.initUiElements(c.children(".fields")),await d.appendHeadHtml(l.headHtml),await d.appendBodyHtml(l.bodyHtml),new d.MatrixInput.Entry(e,c),e.entrySort.addItems(c),e.entrySelect.addItems(c),e.updateAddEntryBtn(),c.css(e.getHiddenEntryCss(c)).velocity({opacity:1,"margin-bottom":10},"fast"),p.requestAnimationFrame(function(){var m;(m=e.elementEditor)==null||m.resume(),t.selfDestruct()})}catch{this.addStatusMessage(d.t("matrix-extended","There was an error dropping the entry"),"error")}e.addingEntry=!1,t.actionDisclosure.hide()}},copyEntry:async function(a,s,i,t){try{const{data:e}=await d.sendActionRequest("POST","matrix-extended/matrix-extended/copy-entry",{data:{fieldId:t.settings.fieldId,entryId:i.id,entryTypeId:s,ownerId:t.settings.ownerId,ownerElementType:t.settings.ownerElementType,siteId:t.settings.siteId,namespace:t.settings.namespace,staticEntries:t.settings.staticEntries}});this.entryReference=e.entryReference,this.checkPaste(a,t),this.checkDuplicate(a,t),await d.appendHeadHtml(e.headHtml),await d.appendBodyHtml(e.bodyHtml),this._hasMatrixExtensionButtonsInitialized,this.addStatusMessage(d.t("matrix-extended","Entry reference copied"))}catch{this.addStatusMessage(d.t("matrix-extended","There was an error copying the entry reference"),"error")}i.actionDisclosure.hide()},duplicateEntry:async function(a,s,i,t){var e;if(!t.addingEntry){if(!t.canAddMoreEntries()){t.updateStatusMessage();return}t.addingEntry=!0,t.elementEditor&&await t.elementEditor.setFormValue(t.settings.baseInputName,"*");try{const{data:o}=await d.sendActionRequest("POST","matrix-extended/matrix-extended/duplicate-entry",{data:{fieldId:t.settings.fieldId,entryId:i.id,entryTypeId:s,ownerId:t.settings.ownerId,ownerElementType:t.settings.ownerElementType,siteId:t.settings.siteId,namespace:t.settings.namespace,staticEntries:t.settings.staticEntries}}),n=r(o.blockHtml);(e=t.elementEditor)==null||e.pause(),n.insertAfter(i.$container),t.trigger("entryAdded",{$entry:n}),n.css("margin-bottom",""),d.initUiElements(n.children(".fields")),await d.appendHeadHtml(o.headHtml),await d.appendBodyHtml(o.bodyHtml),new d.MatrixInput.Entry(t,n),t.entrySort.addItems(n),t.entrySelect.addItems(n),t.updateAddEntryBtn(),n.css(t.getHiddenEntryCss(n)).velocity({opacity:1,"margin-bottom":10},"fast"),p.requestAnimationFrame(function(){var l;(l=t.elementEditor)==null||l.resume()})}catch{this.addStatusMessage(d.t("matrix-extended","There was an error duplicating the entry"),"error")}t.addingEntry=!1,i.actionDisclosure.hide()}},addMenu:function(a,s,i,t){const e=r('<ul class="matrix-extended"></ul>'),o=r('<hr class="padded">');this.addAddBlockButton(e,s,i,t),this.addDuplicateButton(e,s,i,t),this.addCopyButton(e,s,i,t),this.addPasteButton(e,s,i,t),this.addDeleteButton(e,i),this.checkPaste(e,t),this.checkDuplicate(e,t),e.insertBefore(a.find("ul").eq(0)),o.insertAfter(e)},addPasteButton:function(a,s,i,t){if(!this.settings.experimentalFeatures)return;const e=r(`<li>
            <button class="menu-item" data-action="paste" tabindex="0">
                        <span class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M104.6 48H64C28.7 48 0 76.7 0 112V384c0 35.3 28.7 64 64 64h96V400H64c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H80c0 17.7 14.3 32 32 32h72.4C202 108.4 227.6 96 256 96h62c-7.1-27.6-32.2-48-62-48H215.4C211.6 20.9 188.2 0 160 0s-51.6 20.9-55.4 48zM144 56a16 16 0 1 1 32 0 16 16 0 1 1 -32 0zM448 464H256c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16l140.1 0L464 243.9V448c0 8.8-7.2 16-16 16zM256 512H448c35.3 0 64-28.7 64-64V243.9c0-12.7-5.1-24.9-14.1-33.9l-67.9-67.9c-9-9-21.2-14.1-33.9-14.1H256c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64z"/></svg>
                        </span><span class="menu-item-label">${d.t("matrix-extended","Paste")}</span>
                    </button>
                </li>`);a.append(e),e.find("button").on("click",()=>{this.pasteEntry(a,s,i,t)})},addAddBlockButton:function(a,s,i,t){if(!this.settings.experimentalFeatures||!t.$addEntryMenuBtn.length)return;const e=r(`<li>
                    <button class="menu-item" data-action="add-block" tabindex="0">
                        <span class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M64 80c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V96c0-8.8-7.2-16-16-16H64zM0 96C0 60.7 28.7 32 64 32H384c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM200 344V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H248v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/></svg>
                        </span><span class="menu-item-label">${d.t("matrix-extended","Add block above")}</span>
                    </button>
                </li>`);a.append(e),e.find("button").on("click",()=>{const o=t.id;r(".matrix-extended-buttons-above").remove(),r(`#matrix-extended-menu-${o}-all`).remove();const n=r('<div class="buttons matrix-extended-buttons matrix-extended-buttons-above"></div>'),l=t.$addEntryMenuBtn.data("disclosureMenu").$container.find("button").clone().off(),c=d.ui.createButton({label:t.$addEntryMenuBtn.find(".label").text(),spinner:!0}).addClass("btn menubtn dashed add icon").attr("aria-controls",`matrix-extended-menu-${o}-all`),m=r(`<div class="menu menu--disclosure" id="matrix-extended-menu-${o}-all">`),g=r("<ul></ul>");m.append(g),r(document.body).append(m);const y=new p.DisclosureMenu(c);for(const u of l){const h=r("<li></li>"),f=r(u);h.append(f),g.append(h)}if(l.on("activate",async u=>{c.addClass("loading");try{await t.addEntry(r(u.currentTarget).data("type"),i.$container)}finally{y.hide(),c.remove(),m.remove(),n.remove()}}),this.settings.expandMenu){const h=c.data("disclosureMenu").$container.find("button").clone(!0,!0);this.buildGroupedMenu(n,h,c,o,!0)}else n.append(c);n.insertBefore(i.$container),i.actionDisclosure.hide()})},addCopyButton:function(a,s,i,t){if(!this.settings.experimentalFeatures)return;const e=r(`<li>
                    <button class="menu-item" data-action="copy" tabindex="0">
                        <span class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M280 64h40c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128C0 92.7 28.7 64 64 64h40 9.6C121 27.5 153.3 0 192 0s71 27.5 78.4 64H280zM64 112c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16H320c8.8 0 16-7.2 16-16V128c0-8.8-7.2-16-16-16H304v24c0 13.3-10.7 24-24 24H192 104c-13.3 0-24-10.7-24-24V112H64zm128-8a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"/></svg>
                        </span><span class="menu-item-label">${d.t("matrix-extended","Copy")}</span>
                    </button>
                </li>`);a.append(e),e.find("button").on("click",()=>{this.copyEntry(a,s,i,t)})},addDuplicateButton:function(a,s,i,t){const e=r(`<li>
                <button class="menu-item" data-action="duplicate" tabindex="0">
                    <span class="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M64 464H288c8.8 0 16-7.2 16-16V384h48v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h64v48H64c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16zM224 304H448c8.8 0 16-7.2 16-16V64c0-8.8-7.2-16-16-16H224c-8.8 0-16 7.2-16 16V288c0 8.8 7.2 16 16 16zm-64-16V64c0-35.3 28.7-64 64-64H448c35.3 0 64 28.7 64 64V288c0 35.3-28.7 64-64 64H224c-35.3 0-64-28.7-64-64z"/></svg>
                    </span><span class="menu-item-label">${d.t("matrix-extended","Duplicate")}</span>
                </button>
            </li>`);a.append(e),e.find("button").on("click",()=>{this.duplicateEntry(a,s,i,t)})},addDeleteButton:function(a,s){if(!this.settings.extraDeleteButton)return;const i=r(`<li>
                <button class="menu-item error" data-action="delete" tabindex="0">
                    <span class="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>
                    </span><span class="menu-item-label">${d.t("matrix-extended","Delete")}</span>
                </button>
            </li>`);a.append(i),i.find("button").on("click",function(){s.selfDestruct(),s.actionDisclosure.hide()})},buildGroupedMenu:function(a,s,i,t,e=!1){const o=t.replace(/.*fields-/,"");let n=s;if(!this.settings.fields){const u=r('<div class="btngroup matrix-extended-btngroup"></div>');n.first().addClass("add icon"),n.addClass("btn dashed"),u.append(n),a.append(u);return}if(!this.settings.fields[o]){const u=r('<div class="btngroup matrix-extended-btngroup"></div>');n.first().addClass("add icon"),n.addClass("btn dashed"),u.append(n),a.append(u);return}const l=this.settings.fields[o];for(const[u,h]of Object.entries(l.groups)){r(`#matrix-extended-menu-${t}-${u}${e?"-above":""}`).remove();const f=d.ui.createButton({label:h.label,spinner:!0}).addClass("btn menubtn dashed add icon").attr("aria-controls",`matrix-extended-menu-${t}-${u}${e?"-above":""}`).appendTo(a),b=r(`<div class="menu menu--disclosure" id="matrix-extended-menu-${t}-${u}${e?"-above":""}">`),E=r("<ul></ul>");b.append(E),r(document.body).append(b);const M=new p.DisclosureMenu(f);for(const $ of h.types){const v=r("<li></li>"),w=s.filter((B,x)=>r(x).data("type")===$);if(n=n.filter((B,x)=>r(x).data("type")!==$),!w.length){console.warn(`Type ${$} not found in group ${t}`);continue}v.append(w),E.append(v),w.on("activate",()=>{b.remove(),M.destroy()})}}if(!n.length)return;if(this.settings.expandUngrouped){const u=r('<div class="btngroup matrix-extended-btngroup"></div>');n.first().addClass("add icon"),n.addClass("btn dashed"),u.append(n),this.settings.ungroupedPosition==="end"?a.append(u):a.prepend(u);return}r(`#matrix-extended-menu-${t}-others${e?"-above":""}`).remove();const c=d.ui.createButton({label:i.find(".label").text(),spinner:!0}).addClass("btn menubtn dashed add icon").attr("aria-controls",`matrix-extended-menu-${t}-others${e?"-above":""}`);this.settings.ungroupedPosition==="end"?c.appendTo(a):c.prependTo(a);const m=r(`<div class="menu menu--disclosure" id="matrix-extended-menu-${t}-others${e?"-above":""}">`),g=r("<ul></ul>");m.append(g),r(document.body).append(m);const y=new p.DisclosureMenu(c);for(const u of n){const h=r("<li></li>"),f=r(u);h.append(f),g.append(h),f.on("activate",()=>{m.remove(),y.destroy()})}},checkDuplicate:function(a,s){const i=a.find('button[data-action="duplicate"]');i.disable();const t=i.parent();if(t.attr("title",""),!s.canAddMoreEntries()){t.attr("title",d.t("matrix-extended","No more entries can be added."));return}i.enable()},checkPaste:function(a,s){const i=a.find('button[data-action="paste"]');i.disable();const t=i.parent();if(t.attr("title",""),!this.entryReference||!this.entryReference.entryTypeId){t.attr("title",d.t("matrix-extended","There is nothing to paste."));return}if(!this.childParent){t.attr("title",d.t("matrix-extended","The copied entry is not allowed here."));return}if(!s.canAddMoreEntries()){t.attr("title",d.t("matrix-extended","No more entries can be added."));return}if(!(this.childParent[this.entryReference.entryTypeId]||[]).includes(s.settings.fieldId)){t.attr("title",d.t("matrix-extended","The copied entry is not allowed here."));return}i.enable()},addStatusMessage:function(a,s="notice"){s==="notice"&&d.cp.displayNotice(a),s==="error"&&d.cp.displayError(a)}}))})(window);
//# sourceMappingURL=matrixExtendedJs-e8d0f632.js.map