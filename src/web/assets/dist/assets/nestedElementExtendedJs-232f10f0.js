(function(f){const{Craft:i,Garnish:l,$:o}=f;!i||!l||!o||(i.NestedElementExtended=l.Base.extend({settings:{},childParent:{},entryReference:void 0,init:function(e){const t=this;if(this.settings=e.settings||{},this.childParent=e.childParent||{},this.entryReference=e.entryReference||void 0,!l.DisclosureMenu||!i.NestedElementManager)return;const s=i.NestedElementManager.prototype.init;i.NestedElementManager.prototype.init=function(...a){s.apply(this,a),console.log("NestedElementExtended")};const n=l.DisclosureMenu.prototype.show;l.DisclosureMenu.prototype.show=function(...a){t.initDisclosureMenu(this),n.apply(this,a)}},initDisclosureMenu(e){if(!this.settings.experimentalFeatures)return;const{$trigger:t,$container:s}=e;if(!t||!s||!t.hasClass("action-btn"))return;const n=t.closest(".card-actions").parent(".card-actions-container").parent(".card");if(!n.length)return;const{typeId:a,id:d}=n.data();if(!a||!d)return;const r=n.closest(".nested-element-cards").data("nestedElementManager");if(r&&!(r.settings.mode!=="cards"||!r.settings.canCreate)){if(e._hasNestedElementExtensionButtonsInitialized){this.checkDuplicate(s,r);return}e._hasNestedElementExtensionButtonsInitialized=!0,this.addMenu(s,a,n,r)}},addMenu:function(e,t,s,n){const a=o('<ul class="matrix-extended"></ul>'),d=o('<hr class="padded">');this.addDuplicateButton(e,a,t,s,n),a.insertBefore(e.find("ul").eq(0)),d.insertAfter(a),this.checkDuplicate(e,n)},addDuplicateButton:function(e,t,s,n,a){const d=o(`<li>
                <button class="menu-item" data-action="duplicate" tabindex="0">
                    <span class="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M64 464H288c8.8 0 16-7.2 16-16V384h48v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h64v48H64c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16zM224 304H448c8.8 0 16-7.2 16-16V64c0-8.8-7.2-16-16-16H224c-8.8 0-16 7.2-16 16V288c0 8.8 7.2 16 16 16zm-64-16V64c0-35.3 28.7-64 64-64H448c35.3 0 64 28.7 64 64V288c0 35.3-28.7 64-64 64H224c-35.3 0-64-28.7-64-64z"/></svg>
                    </span><span class="menu-item-label">${i.t("matrix-extended","Duplicate")}</span>
                </button>
            </li>`);t.append(d),d.find("button").on("click",()=>{this.duplicateEntry(e,t,s,n,a)})},duplicateEntry:async function(e,t,s,n,a){if(a.canCreate()){try{await a.markAsDirty();const{data:d}=await i.sendActionRequest("POST","matrix-extended/nested-element-extended/duplicate-entry",{data:{fieldId:n.data().fieldId,entryId:n.data().id,entryTypeId:s,ownerId:a.settings.ownerId,ownerElementType:a.settings.ownerElementType,siteId:a.settings.ownerSiteId}});await this.addElementCard(d,a,n.data("id"))}catch{this.addStatusMessage(i.t("matrix-extended","There was an error duplicating the entry"),"error")}e.data("disclosureMenu").hide()}},checkDuplicate:function(e,t){const s=e.find('button[data-action="duplicate"]');s.disable();const n=s.parent();if(n.attr("title",""),!t.canCreate()){n.attr("title",i.t("matrix-extended","No more entries can be added."));return}s.enable()},async addElementCard(e,t,s){var u,r,p,h;t.$createBtn&&t.$createBtn.addClass("loading");let n;try{n=await i.sendActionRequest("POST","app/render-elements",{data:{elements:[{type:t.elementType,id:e.id,siteId:e.siteId,instances:[{context:"field",ui:"card",sortable:t.settings.sortable,showActionMenu:!0}]}]}})}catch(c){throw i.cp.displayError((r=(u=c==null?void 0:c.response)==null?void 0:u.data)==null?void 0:r.message),((h=(p=c==null?void 0:c.response)==null?void 0:p.data)==null?void 0:h.message)??c}finally{t.$createBtn&&t.$createBtn.removeClass("loading")}t.$elements||t.initCards();const a=o("<li/>"),d=o(n.data.elements[e.id][0]).appendTo(a);return t.$elements.find(`[data-id="${s}"`).parent().after(a),t.initElement(d),await i.appendHeadHtml(n.data.headHtml),await i.appendBodyHtml(n.data.bodyHtml),i.cp.elementThumbLoader.load(d),t.updateCreateBtn(),d},addStatusMessage:function(e,t="notice"){t==="notice"&&i.cp.displayNotice(e),t==="error"&&i.cp.displayError(e)}}))})(window);
//# sourceMappingURL=nestedElementExtendedJs-232f10f0.js.map
