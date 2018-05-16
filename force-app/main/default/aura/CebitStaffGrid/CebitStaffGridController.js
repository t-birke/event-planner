({
	init : function(c, e, h) {
		h.init(c,e,h);
	},
	filter : function(c,e,h) {
		h.filter(c,e,h);
        },

		setConstraint : function(c,e,h) {
			//e.target.classList.add("slds-is-new");
			const data = e.target.id.split("-");
			let constraints = [];
			let availability = false;
			//check if Staff is already on Change List
			const existingChangeSet = c.get("v.Changes").filter( (c) => c.Id === data[1]);
			if(existingChangeSet.length > 0) {
					const eC = existingChangeSet[0].Shift_Constraints__c;
					constraints = eC ? eC.split(";") : [];
					availability = existingChangeSet[0].Available__c;
				} else {
					//if not, check if there are saved constraints
					const eC = c.get("v.allStaff").get(data[1]).Shift_Constraints__c;
					constraints = eC ? eC.split(";") : [];
					availability = c.get("v.allStaff").get(data[1]).Available__c;
				}
				constraints.includes(data[0]) ? constraints = constraints.filter((c) => c != data[0]) : constraints.push(data[0]);

						if(c.get("v.unsavedChanges")){
							c.set("v.Changes", c.get("v.Changes").filter( (c) => c.Id !== data[1]).concat([{Id : data[1], Shift_Constraints__c: constraints.join(';'), Available__c: availability}]));
						} else {
							c.set("v.Changes", [{Id : data[1], Shift_Constraints__c: constraints.join(';'), Available__c: availability}]);
							c.set("v.unsavedChanges", true);
						}


		},

		setAvailability : function(c,e,h) {
			//console.log("set Availability event > ",e.getSource().get("v.name"));
			const data = e.getSource().get("v.name").split("-");
			let availability = data[0];
			let constraints = "";
			//check if Staff is already on Change List
			const existingChangeSet = c.get("v.Changes").filter( (c) => c.Id === data[1]);
			if(existingChangeSet.length > 0) {
					constraints = existingChangeSet[0].Shift_Constraints__c;
				} else {
					//if not, check the saved values
					const staff = c.get("v.allStaff").get(data[1])
					constraints = staff.Shift_Constraints__c;
				}
						if(c.get("v.unsavedChanges")){
							c.set("v.Changes", c.get("v.Changes").filter( (c) => c.Id !== data[1]).concat([{Id : data[1], Shift_Constraints__c: constraints, Available__c: availability}]));
						} else {
							c.set("v.Changes", [{Id : data[1], Shift_Constraints__c: constraints, Available__c: availability}]);
							c.set("v.unsavedChanges", true);
						}


		},

		cancel : function(c,e,h){
			$A.util.toggleClass(c.find("StaffConstraintGridSpinner"),"slds-hide");
			$A.util.toggleClass(c.find("StaffConstraintGrid"),"slds-hide");
			h.init(c,e,h);
			c.set("v.Changes", []);
			c.set("v.unsavedChanges", false);
		},

		saveChanges : function(c,e,h){
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
									c.set("v.unsavedChanges", false);
                	var data = response.getReturnValue();
                    if(data){
                    				c.set("v.allStaff",new Map(data.Staff.map( (s) => ([s.Id,s]))));
														h.loadOptions(c,data.Staff);
														h.filterByManager(c,data.Staff);
														$A.util.toggleClass(c.find("StaffConstraintGridSpinner"),"slds-hide");
														$A.util.toggleClass(c.find("StaffConstraintGrid"),"slds-hide");
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

    status : function(c,e,h) {
    	console.log('managerFilterOptions > ',c.get("v.managerFilterOptions"));
}
})