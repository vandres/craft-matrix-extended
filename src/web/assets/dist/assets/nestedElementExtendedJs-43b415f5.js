(function(a){const{Craft:t,Garnish:n,$:l}=a;!t||!n||!l||(t.NestedElementExtended=n.Base.extend({settings:{},childParent:{},entryReference:void 0,init:function(s){const e=this;if(this.settings=s.settings||{},this.childParent=s.childParent||{},this.entryReference=s.entryReference||void 0,!n.DisclosureMenu||!t.NestedElementManager)return;const o=t.NestedElementManager.prototype.init;t.NestedElementManager.prototype.init=function(...i){if(o.apply(this,i),!e.settings.experimentalFeatures)return;const r=this;if(r.settings.mode!=="cards"||!r.settings.canCreate)return;console.log("NestedElementManager"),console.log(r.settings),console.log(e.settings);const c=n.DisclosureMenu.prototype.show;n.DisclosureMenu.prototype.show=function(...u){e.initDisclosureMenu(this),c.apply(this,u)}}},initDisclosureMenu(s){console.log("initDisclosureMenu");const{$trigger:e,$container:o}=s;if(!e||!o||!e.hasClass("action-btn"))return;const i=e.closest(".card-actions").parent(".card-actions-container").parent(".card");if(!i.length)return;const{typeId:r,id:c}=i.data();!r||!c||console.log(i.data())}}))})(window);
//# sourceMappingURL=nestedElementExtendedJs-43b415f5.js.map
