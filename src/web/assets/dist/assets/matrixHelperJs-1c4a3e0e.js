(function(r){const{Craft:t,Garnish:n,$:i}=r;!t||!n||!i||(t.MatrixExtendedHelper=n.Base.extend({settings:{},childParent:{},entryTypes:[],entryReference:void 0,init:function(e){this.settings=e.settings||{},this.childParent=e.childParent||{},this.entryTypes=e.entryTypes||[],this.entryReference=e.entryReference||void 0,!n.DisclosureMenu||t.MatrixInput},getEntryTypeById:function(e){return this.entryTypes.find(s=>+s.id==+e)},getEntryReference:function(){return this.entryReference},setEntryReference:function(e){this.entryReference=e},isEntryReferenceAllowed:function(e){return!(!this.childParent||!(this.childParent[this.entryReference.entryTypeId]||[]).includes(e))}}))})(window);
//# sourceMappingURL=matrixHelperJs-1c4a3e0e.js.map
