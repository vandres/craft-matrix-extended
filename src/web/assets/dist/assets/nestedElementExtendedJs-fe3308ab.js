(function(B){const{Craft:d,Garnish:f,$:r}=B;!d||!f||!r||(d.NestedElementExtended=f.Base.extend({settings:{},childParent:{},helper:void 0,init:function(a,n){const i=this;if(this.settings=a.settings||{},this.childParent=a.childParent||{},this.helper=n,!f.DisclosureMenu||!d.NestedElementManager)return;const e=d.NestedElementManager.prototype.init;d.NestedElementManager.prototype.init=function(...o){e.apply(this,o)},d.NestedElementManager.prototype.createElementEditor,d.NestedElementManager.prototype.createElementEditor=function(o){const c=d.createElementEditor(this.elementType,o,{onBeforeSubmit:async()=>{typeof this.elementEditor<"u"&&f.hasAttr(o,"data-owner-is-canonical")&&!this.elementEditor.settings.isUnpublishedDraft&&(await c.elementEditor.checkForm(!0,!0),await this.markAsDirty())},onSubmit:u=>{u.data.id!=o.data("id")&&(o.attr("data-id",u.data.id).data("id",u.data.id).data("owner-id",u.data.ownerId),d.refreshElementInstances(u.data.id))}})};const t=f.DisclosureMenu.prototype.show;f.DisclosureMenu.prototype.show=function(...o){i.initDisclosureMenu(this),t.apply(this,o)};const s=f.DisclosureMenu.prototype.init;f.DisclosureMenu.prototype.init=function(...o){s.apply(this,o),i.initAddButtonMenu(this)}},initDisclosureMenu(a){if(!this.settings.experimentalFeatures)return;const{$trigger:n,$container:i}=a;if(!n||!i||!n.hasClass("action-btn"))return;const e=n.closest(".card-actions").parent(".card-actions-container").parent(".card");if(!e.length)return;const{typeId:t,id:s}=e.data();if(!t||!s)return;const c=e.closest(".nested-element-cards").data("nestedElementManager");if(c&&!(c.settings.mode!=="cards"||!c.settings.canCreate)){if(a._hasNestedElementExtensionButtonsInitialized){this.checkPaste(i,e,c),this.checkDuplicate(i,c);return}a._hasNestedElementExtensionButtonsInitialized=!0,this.addMenu(i,t,e,c)}},initAddButtonMenu(a){if(!this.settings.expandMenu)return;const{$trigger:n,$container:i}=a,e=n.parent(),t=n.closest(".nested-element-cards"),s=t.data("nestedElementManager");if(!s||!n||!i||e.hasClass("card-actions")||!t.attr("id")||!Array.isArray(s.settings.createAttributes)||n._hasNestedElementExtensionButtonsInitialized)return;n.hide(),n._hasNestedElementExtensionButtonsInitialized=!0;const o=r('<div class="buttons matrix-extended-buttons"></div>'),c=d.ui.createButton({label:s.settings.createButtonLabel,spinner:!0}).addClass("add icon disabled"),u=r("<div/>").appendTo(i);c.addClass("dashed").appendTo(u);const y=`menu-${Math.floor(Math.random()*1e6)}`,h=r("<div/>",{id:y,class:"menu menu--disclosure"}).insertAfter(c),E=r("<ul/>").appendTo(h);for(const p of s.settings.createAttributes){const b=r("<li/>").appendTo(E);let w="";if(p.icon){const m=r(`<span class="icon">${p.icon}</span>`);p.color&&m.addClass(p.color),w+=m.prop("outerHTML")}w+=`<span class="label">${p.label}</span>`;const x=r("<button/>",{type:"button",class:"menu-item","data-type":this.helper.getEntryTypeById(p.attributes.typeId).name,html:w}).appendTo(b);this.addListener(x,"activate",m=>{m.preventDefault(),c.data("disclosureMenu").hide(),s.createElement(p.attributes)})}c.attr("aria-controls",y).attr("data-disclosure-trigger","true").addClass("menubtn").disclosureMenu();const l=c.disclosureMenu().data("disclosureMenu").$container.find("button").clone().off().on("activate",async p=>{const b=r(p.currentTarget);c.disclosureMenu().data("disclosureMenu").$container.find("button").filter((x,m)=>r(m).data("type")===b.data("type")).trigger("activate")}),g=t.attr("id");this.buildGroupedMenu(o,l,n,g),o.appendTo(e)},buildGroupedMenu:function(a,n,i,e,t=!1){let s=e.replace(/.*fields-/,"");s=s.replace(/-element-index-.*/,"");let o=n;if(!this.settings.fields){const l=r('<div class="btngroup matrix-extended-btngroup"></div>');o.first().addClass("add icon"),o.addClass("btn dashed"),l.append(o),a.append(l);return}if(!this.settings.fields[s]){const l=r('<div class="btngroup matrix-extended-btngroup"></div>');o.first().addClass("add icon"),o.addClass("btn dashed"),l.append(o),a.append(l);return}const c=this.settings.fields[s];c.oneLiner&&a.addClass("one-line");for(const[l,g]of Object.entries(c.groups)){r(`#matrix-extended-menu-${e}-${l}${t?"-above":""}`).remove();const p=d.ui.createButton({label:g.label,spinner:!0}).addClass("btn menubtn dashed add icon").attr("aria-controls",`matrix-extended-menu-${e}-${l}${t?"-above":""}`).appendTo(a),b=r(`<div class="menu menu--disclosure" id="matrix-extended-menu-${e}-${l}${t?"-above":""}">`),w=r("<ul></ul>");b.append(w),r(document.body).append(b);const x=new f.DisclosureMenu(p);for(const m of g.types){const I=r("<li></li>"),M=n.filter((C,$)=>r($).data("type")===m);if(o=o.filter((C,$)=>r($).data("type")!==m),!M.length){console.warn(`Type ${m} not found in group ${e}`);continue}I.append(M),w.append(I),M.on("activate",()=>{if(!t){x.hide();return}b.remove(),x.destroy()})}}if(!o.length)return;if(this.settings.expandUngrouped){const l=r('<div class="btngroup matrix-extended-btngroup"></div>');o.first().addClass("add icon"),o.addClass("btn dashed"),l.append(o),this.settings.ungroupedPosition==="end"?a.append(l):a.prepend(l);return}r(`#matrix-extended-menu-${e}-others${t?"-above":""}`).remove();const u=d.ui.createButton({label:i.find(".label").text(),spinner:!0}).addClass("btn menubtn dashed add icon").attr("aria-controls",`matrix-extended-menu-${e}-others${t?"-above":""}`);this.settings.ungroupedPosition==="end"?u.appendTo(a):u.prependTo(a);const y=r(`<div class="menu menu--disclosure" id="matrix-extended-menu-${e}-others${t?"-above":""}">`),h=r("<ul></ul>");y.append(h),r(document.body).append(y);const E=new f.DisclosureMenu(u);for(const l of o){const g=r("<li></li>"),p=r(l);g.append(p),h.append(g),p.on("activate",()=>{if(!t){E.hide();return}y.remove(),E.destroy()})}},addMenu:function(a,n,i,e){const t=r('<ul class="matrix-extended"></ul>'),s=r('<hr class="padded">');this.addDuplicateButton(a,t,n,i,e),this.addCopyButton(a,t,n,i,e),this.addPasteButton(a,t,n,i,e),t.insertBefore(a.find("ul").eq(0)),s.insertAfter(t),this.checkPaste(a,i,e),this.checkDuplicate(a,e)},addDuplicateButton:function(a,n,i,e,t){const s=r(`<li>
                <button class="menu-item" data-action="duplicate" tabindex="0">
                    <span class="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M64 464H288c8.8 0 16-7.2 16-16V384h48v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h64v48H64c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16zM224 304H448c8.8 0 16-7.2 16-16V64c0-8.8-7.2-16-16-16H224c-8.8 0-16 7.2-16 16V288c0 8.8 7.2 16 16 16zm-64-16V64c0-35.3 28.7-64 64-64H448c35.3 0 64 28.7 64 64V288c0 35.3-28.7 64-64 64H224c-35.3 0-64-28.7-64-64z"/></svg>
                    </span><span class="menu-item-label">${d.t("matrix-extended","Duplicate")}</span>
                </button>
            </li>`);n.append(s),s.find("button").on("click",()=>{this.duplicateEntry(a,n,i,e,t)})},duplicateEntry:async function(a,n,i,e,t){if(t.canCreate()){try{await t.markAsDirty();const{data:s}=await d.sendActionRequest("POST","matrix-extended/nested-element-extended/duplicate-entry",{data:{attribute:t.settings.attribute,fieldId:e.data().fieldId,entryId:e.data().id,entryTypeId:i,ownerId:t.settings.ownerId,ownerElementType:t.settings.ownerElementType,siteId:t.settings.ownerSiteId}});await this.addElementCard(s,t,e.data("id"))}catch{this.addStatusMessage(d.t("matrix-extended","There was an error duplicating the entry"),"error")}a.data("disclosureMenu").hide()}},checkDuplicate:function(a,n){const i=a.find('button[data-action="duplicate"]');i.disable();const e=i.parent();if(e.attr("title",""),!n.canCreate()){e.attr("title",d.t("matrix-extended","No more entries can be added."));return}i.enable()},addCopyButton:function(a,n,i,e,t){const s=r(`<li>
                    <button class="menu-item" data-action="copy" tabindex="0">
                        <span class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M280 64h40c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128C0 92.7 28.7 64 64 64h40 9.6C121 27.5 153.3 0 192 0s71 27.5 78.4 64H280zM64 112c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16H320c8.8 0 16-7.2 16-16V128c0-8.8-7.2-16-16-16H304v24c0 13.3-10.7 24-24 24H192 104c-13.3 0-24-10.7-24-24V112H64zm128-8a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"/></svg>
                        </span><span class="menu-item-label">${d.t("matrix-extended","Copy")}</span>
                    </button>
                </li>`);n.append(s),s.find("button").on("click",()=>{this.copyEntry(a,n,i,e,t)})},copyEntry:async function(a,n,i,e,t){try{const{data:s}=await d.sendActionRequest("POST","matrix-extended/nested-element-extended/copy-entry",{data:{attribute:t.settings.attribute,fieldId:e.data().fieldId,entryId:e.data().id,entryTypeId:i,ownerId:t.settings.ownerId,ownerElementType:t.settings.ownerElementType,siteId:t.settings.ownerSiteId}});this.helper.setEntryReference(s.entryReference),this.checkPaste(a,e,t),this.checkDuplicate(a,t),await d.appendHeadHtml(s.headHtml),await d.appendBodyHtml(s.bodyHtml),this.addStatusMessage(d.t("matrix-extended","Entry reference copied"))}catch{this.addStatusMessage(d.t("matrix-extended","There was an error copying the entry reference"),"error")}a.data("disclosureMenu").hide()},addPasteButton:function(a,n,i,e,t){const s=r(`<li>
            <button class="menu-item" data-action="paste" tabindex="0"> 
                        <span class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M104.6 48H64C28.7 48 0 76.7 0 112V384c0 35.3 28.7 64 64 64h96V400H64c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H80c0 17.7 14.3 32 32 32h72.4C202 108.4 227.6 96 256 96h62c-7.1-27.6-32.2-48-62-48H215.4C211.6 20.9 188.2 0 160 0s-51.6 20.9-55.4 48zM144 56a16 16 0 1 1 32 0 16 16 0 1 1 -32 0zM448 464H256c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16l140.1 0L464 243.9V448c0 8.8-7.2 16-16 16zM256 512H448c35.3 0 64-28.7 64-64V243.9c0-12.7-5.1-24.9-14.1-33.9l-67.9-67.9c-9-9-21.2-14.1-33.9-14.1H256c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64z"/></svg>
                        </span><span class="menu-item-label">${d.t("matrix-extended","Paste")}</span>
                    </button>
                </li>`);n.append(s),s.find("button").on("click",()=>{this.pasteEntry(a,n,i,e,t)})},checkPaste:function(a,n,i){const e=a.find('button[data-action="paste"]');e.disable();const t=e.parent();if(t.attr("title",""),!this.helper.getEntryReference()||!this.helper.getEntryReference().entryTypeId){t.attr("title",d.t("matrix-extended","There is nothing to paste."));return}if(!i.canCreate()){t.attr("title",d.t("matrix-extended","No more entries can be added."));return}if(!this.helper.isEntryReferenceAllowed(n.data().fieldId)){t.attr("title",d.t("matrix-extended","The copied entry is not allowed here."));return}e.enable()},pasteEntry:async function(a,n,i,e,t){if(t.canCreate()){try{await t.markAsDirty();const{data:s}=await d.sendActionRequest("POST","matrix-extended/nested-element-extended/paste-entry",{data:{attribute:t.settings.attribute,fieldId:e.data().fieldId,entryId:e.data().id,entryTypeId:i,ownerId:t.settings.ownerId,ownerElementType:t.settings.ownerElementType,siteId:t.settings.ownerSiteId}});await this.addElementCard(s,t,e.data("id"))}catch{this.addStatusMessage(d.t("matrix-extended","There was an error pasting the entry"),"error")}a.data("disclosureMenu").hide()}},async addElementCard(a,n,i){var o,c,u,y;n.$createBtn&&n.$createBtn.addClass("loading");let e;try{e=await d.sendActionRequest("POST","app/render-elements",{data:{elements:[{type:n.elementType,id:a.id,ownerId:n.settings.ownerId,siteId:a.siteId,instances:[{context:"field",ui:"card",sortable:n.settings.sortable,showActionMenu:!0}]}]}})}catch(h){throw d.cp.displayError((c=(o=h==null?void 0:h.response)==null?void 0:o.data)==null?void 0:c.message),((y=(u=h==null?void 0:h.response)==null?void 0:u.data)==null?void 0:y.message)??h}finally{n.$createBtn&&n.$createBtn.removeClass("loading")}n.$elements||n.initCards();const t=r("<li/>"),s=r(e.data.elements[a.id][0]).appendTo(t);return n.$elements.find(`[data-id="${i}"`).parent().after(t),n.initElement(s),await d.appendHeadHtml(e.data.headHtml),await d.appendBodyHtml(e.data.bodyHtml),d.cp.elementThumbLoader.load(s),n.updateCreateBtn(),s},addStatusMessage:function(a,n="notice"){n==="notice"&&d.cp.displayNotice(a),n==="error"&&d.cp.displayError(a)}}))})(window);
//# sourceMappingURL=nestedElementExtendedJs-fe3308ab.js.map
