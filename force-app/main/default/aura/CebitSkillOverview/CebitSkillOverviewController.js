({
	init : function(c, e, h) {
		h.init(c,e,h);
	},

    filter : function(c,e,h) {
        h.filter(c,e,h);
        c.set("v.readyForToggleCheck", true);
    },

		setSkill : function(c,e,h) {
			const id = e.getSource().get("v.name");
			const skill = e.getSource().get("v.value");
			let skills = [];
			//check if Staff is already on Change List
			const existingChangeSet = c.get("v.Changes").filter( (c) => c.Id === id);
			if(existingChangeSet.length > 0) {
					const eC = existingChangeSet[0].Cloud__c;
					skills = eC ? eC.split(";") : [];
				} else {
					//if not, check if there are saved skills
					const eC = c.get("v.allStaff").get(id).Cloud__c;
					skills = eC ? eC.split(";") : [];
				}
				skills.includes(skill) ? skills = skills.filter((c) => c != skill) : skills.push(skill);

						if(c.get("v.unsavedChanges")){
							c.set("v.Changes", c.get("v.Changes").filter( (c) => c.Id !== id).concat([{Id : id, Cloud__c: skills.join(';')}]));
						} else {
							c.set("v.Changes", [{Id : id, Cloud__c: skills.join(';')}]);
							c.set("v.unsavedChanges", true);
						}
				console.log("Changes > ",c.get("v.Changes"));

		},

		cancel : function(c,e,h){
            $A.util.toggleClass(c.find("StaffConstraintGridSpinner"),"slds-hide");
			$A.util.toggleClass(c.find("StaffConstraintGrid"),"slds-hide");
			h.init(c,e,h);
			c.set("v.Changes", []);
			c.set("v.unsavedChanges", false);
		},

		saveChanges : function(c,e,h){
            c.set("v.unsavedChanges", false);
			$A.util.toggleClass(c.find("StaffConstraintGridSpinner"),"slds-hide");
			$A.util.toggleClass(c.find("StaffConstraintGrid"),"slds-hide");
			var saveAction = c.get("c.updateStaff");
        		saveAction.setParams({type: "SE",
                                        staffUpdate: c.get("v.Changes")
            	});
        		saveAction.setCallback(this, function(response) {
                    var state = response.getState();
            		if (state === "SUCCESS") {
            			c.set("v.Changes", []);
									
                	var data = response.getReturnValue();
                    if(data){
                    				c.set("v.allStaff",new Map(data.Staff.map( (s) => ([s.Id,s]))));
														h.loadOptions(c,data.Staff);
														h.filterByManager(c,data.Staff);
                        								h.filter(c,null,h);
														$A.util.toggleClass(c.find("StaffConstraintGridSpinner"),"slds-hide");
														$A.util.toggleClass(c.find("StaffConstraintGrid"),"slds-hide");
														c.set("v.readyForToggleCheck",true);
                    var resultsToast = $A.get("e.force:showToast");
                    	resultsToast.setParams({
                        "type" : "success",
                        "title": "save changes",
                        "message": "Changes successfully saved."
                    	});
                        resultsToast.fire();

                        } else {
                            var resultsToast = $A.get("e.force:showToast");
                            resultsToast.setParams({
                            "type" : "warning",
                            "title": "save changes",
                            "message": "Something went wrong."
                            });
                            resultsToast.fire();
                        }
                    } else {
                        var resultsToast = $A.get("e.force:showToast");
                    	resultsToast.setParams({
                        "type" : "warning",
                        "title": "save changes",
                        "message": "Something went wrong."
                    	});
                        resultsToast.fire();
                    }
                });
                $A.enqueueAction(saveAction);

		},
		toggleCheckboxes : function(c,e,h) {
            if(c.get("v.readyForToggleCheck")){
            c.set("v.readyForToggleCheck", false);
            const toggles = c.find("toggle");
                if(toggles && toggles.length > 0){
                    const staff = c.get("v.allStaff");
                    for(const box of toggles){
                        staff.get(box.get("v.name"))['s_' + box.get("v.value")] && box.set("v.checked",true);
    				}
                    
                }

            }

}
})