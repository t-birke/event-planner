({
    init : function(c,e,h){
        const action = c.get("c.getStaff");
    action.setParams({type: c.get("v.type")});
    action.setCallback(this, function(response) {
	    const state = response.getState();
	    if(state === "SUCCESS") {
				console.log(response.getState());
				const data = response.getReturnValue();
            	const staff = new Map(data.Staff.map( (s) => {
                    if(s.Cloud__c){
                    const sC = s.Cloud__c.split(";");
                    for(const sce of sC){
                        s['s_' + sce] = true;
                    }
                    return [s.Id,s];
                } else {
                    return [s.Id,s];
                }
            }));
                c.set("v.allStaff",staff);
				h.loadOptions(c,data.Staff);
				c.set("v.Skills",data.SkillOptions);
				h.filterByManager(c,data.Staff);
                h.filter(c,null,h);
				$A.util.toggleClass(c.find("StaffConstraintGridSpinner"),"slds-hide");
				$A.util.toggleClass(c.find("StaffConstraintGrid"),"slds-hide");
        c.set("v.readyForToggleCheck",true);
	    }
	    else if (state === "ERROR") {
	      const error = response.getError();
	      console.log("Error with Cebit Staff Controller -> " + error[0].getMessage);
	    }
	    else {
	      console.log('Unknown problem, response state: ' + state);
	    }
   	});
    $A.enqueueAction(action);
    },
	loadOptions : function(c,data) {
		c.set("v.managerFilterOptions", data.filter( (s) => s.is_manager__c === true).map( (s) => ({ value: s.Id, label: s.Name})).concat([{value: "all", label: "all"}]));
        c.set("v.availabilityOptions", [{ value: "available", label: "available"},{ value: "not available", label: "not available"},{ value: "all", label: "all"}]);
	},
	filterByManager : function(c,data) {
        const staff = data.map( (s) => {
			if(s.Cloud__c){
				const sC = s.Cloud__c.split(";");
				for(const sce of sC){
					s['s_' + sce] = true;
				}
				return s;
			} else {
				return s;
			}
		});
		c.set("v.staff",staff);
	},
	filter : function(c,e,h) {
        if(e){
            const value = e.getParam("value");
            const name = e.getSource().get("v.name");
            switch (name) {
                case "manager":
                    //set component value
                    c.set("v.managerFilter",value);
                    break; 
                case "availability":
                    //set component value
                    c.set("v.availabilityFilter",value);
                break;
            default: 
            
            }
        }
        const managerFilter = c.get("v.managerFilter");
        const availabilityFilter = c.get("v.availabilityFilter");
        //filter stafflist for manager
        let staff = Array.from(c.get("v.allStaff").values()).filter( (s) => (managerFilter == "all" || s.Manager__c === managerFilter));
        //filter for availability
        staff = staff.filter( (s) => (availabilityFilter == "all" || (availabilityFilter == "not available" && s.Available__c == false) || (availabilityFilter == "available" && s.Available__c)))
        c.set("v.staff", staff);
        
        }

})