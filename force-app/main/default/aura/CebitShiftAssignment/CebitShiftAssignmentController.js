({
	init : function(c, e, h) {
        h.init(c, e, h);
	},

    setManagerFilter : function(c,e,h){
        c.set("v.managerFilter",e.getParam("value"));
    },
    filter : function(c,e,h) {
        const value = e.getParam("value");
        const name = e.getSource().get("v.name");
        switch (name) {
    		case "area":
            	//filter boothlist for area
            	c.set("v.boothList",Array.from(c.get("v.allBooths").values()).filter( (b) => (value == "all" || b.Section__r.Area__r.Name == value)));
            	//filter section list for area
            	//TODO
            break; 
            case "section":
            	c.set("v.boothList",Array.from(c.get("v.allBooths").values()).filter( (b) => (value == "all" || b.Section__r.Name == value)));
                //filter area list for section
            	//TODO
            break;
    	default: 
        
		}
	},

		cancel : function(c,e,h){
            $A.util.toggleClass(c.find("ShiftAssignmentGridSpinner"),"slds-hide");
			$A.util.toggleClass(c.find("ShiftAssignmentGrid"),"slds-hide");
			h.init(c,e,h);
			c.set("v.Changes", []);
			c.set("v.unsavedChanges", false);
		},

		saveChanges : function(c,e,h){
			$A.util.toggleClass(c.find("ShiftAssignmentGridSpinner"),"slds-hide");
			$A.util.toggleClass(c.find("ShiftAssignmentGrid"),"slds-hide");
            //set arrays
            const addAssignments = c.get("v.Changes").filter( (a) => !a.Id );
            const removeAssignments = c.get("v.Changes").filter( (a) => a.Id != undefined );
            var saveAction = c.get("c.updateStaffAssignment");
        		saveAction.setParams({"addAssignments": addAssignments,
                                        "removeAssignments": removeAssignments
            	});
        		saveAction.setCallback(this, function(response) {
                    var state = response.getState();
            		if (state === "SUCCESS") {
                		var data = response.getReturnValue();
                    	if(data){
                            var resultsToast = $A.get("e.force:showToast");
                            resultsToast.setParams({
                                "type" : "success",
                                "title": "save changes",
                                "message": "Changes successfully saved."
                                });
                            resultsToast.fire();
                            c.set("v.Changes", []);
							c.set("v.unsavedChanges", false);
                    		h.init(c,e,h);
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
                        "message": "Something went wrong. (" + state + ")"
                    	});
                        resultsToast.fire();
                        console.log("ERROR",response.getError());
                    }
                });
                $A.enqueueAction(saveAction);
		},
    setVariable : function(c,e,h){
        e.getSource().get("v.name") == "date" && (c.set("v.selectedDay",e.getSource().get("v.value")));
    },
    showOptions : function(c,e,h){
        const allBooths = c.get("v.allBooths");
        const booth = allBooths.get(e.target.dataset.booth);
        let shift = booth.Shifts__r.filter( (s) => s.Id == e.target.name)[0];
        const allShiftMap = Array.from(c.get("v.allStaffShiftAssignments").values());
        const allShiftsToday = allShiftMap.filter( (s) => s.Shift__r.Date__c == c.get("v.selectedDay"));
        const currentDay = c.get("v.daysWithShifts").filter( (d) => d.date == c.get("v.selectedDay")).map( (day) => day.dayNumber.toString())[0];
        let availableList = Array.from(c.get("v.allStaff").values()).filter( (s) => s.Available__c && !s['c'+currentDay+'_'+shift.Shift_Order__c]).map( (s) => ({Name:s.Name,Cloud:s[booth.Cloud_Focus__c],Industry:s[booth.Industry__c],Id:s.Id,"Manager__c":s.Manager__c}));
        //filter out everyone whose manager is not selected
        availableList = availableList.filter((s) => (c.get("v.managerFilter") == "all" || s.Manager__c == c.get("v.managerFilter")));
        console.log("availableList",availableList);
        //filter out people with shifts that slot
        availableList = availableList.filter((s) => {
            const stfs = allShiftsToday.filter( (shi) => shi.Staff__r.Id == s.Id);
            let returnValue = true;
            for(const sh of stfs){
            	shift.Shift_Order__c == sh.Shift__r.Shift_Order__c && (returnValue = false);
        	}
            return returnValue
        });
        //add information about shifts today
        availableList = availableList.map( (s) => {
            s["ShiftsAlready"] = allShiftsToday.filter( (shi) => shi.Staff__r.Id == s.Id).length;
            return s;
        });
        //sort by cloud
            availableList.sort( (a,b) => {
            	//build score
            	let ascore="";
            	let bscore="";
            	//Cloud
           		a.Cloud ? ascore = "1" : ascore = "2"
            	b.Cloud ? bscore = "1" : bscore = "2"
            	//Industry
            	a.Industry ? ascore += "1" : ascore += "2"
            	b.Industry ? bscore += "1" : bscore += "2"
            	//ShiftsAlready
            	a.ShiftsAlready ? ascore += (a.ShiftsAlready+1) : ascore += "1"
            	b.ShiftsAlready ? bscore += (b.ShiftsAlready+1) : bscore += "1"
            
            	return ascore - bscore;
        });
        c.set('v.showMenuListFiltered',availableList);
        c.set('v.showMenuList',availableList);
        c.set('v.showMenu',e.target.name);
        
    },
        hideOptions : function(c,e,h){
            //c.set('v.showMenu',"");
        },
            addStaff : function(c,e,h){
                
                const staffId = e.getParam("staffId");
                const shiftId = e.getParam("shiftId");
                const staffName = c.get("v.allStaff").get(staffId).Name;
                let ShiftOrder = 0;
                // add data to boothlist
                let bl = Array.from(c.get("v.allBooths").values());
                bl = bl.map( (b) => {
                    for(let s of b.Shifts__r){
                    if(s.Id == shiftId){
                    	s["SE"] = {Name:staffName,Id:staffId};
                        ShiftOrder = s.Shift_Order__c;
                            }
                		
                    }
            		return b
                	});
        		c.set("v.boothList",bl);
            	c.set("v.allBooths",new Map(bl.map( (b) => ([b.Id,b]))));
                // add data to ShiftAssignments
        const sa = {
            "Shift__r":{"Id":shiftId,"Date__c":c.get("v.selectedDay"),"Shift_Order__c":ShiftOrder},
            "Staff__r":{"Id":staffId}
        };
       c.set("v.allStaffShiftAssignments",c.get("v.allStaffShiftAssignments").set(sa.Shift__r.Id,sa));
                
           //Push new Staff Assignment to Change List
				if(c.get("v.unsavedChanges")){
                    let existingChangeSet = c.get("v.Changes");
                    existingChangeSet.push({"sobjectType" : "Staff_on_Shift__c","Shift__c":shiftId,"Staff__c":staffId});
                    c.set("v.Changes",existingChangeSet);
                } else {
                    c.set("v.Changes", [{"sobjectType" : "Staff_on_Shift__c","Shift__c":shiftId,"Staff__c":staffId}]);
                    c.set("v.unsavedChanges", true);
                }
                c.set('v.showMenu',"");
            },
            removeStaff : function (c,e,h){
                const data = e.getSource().get("v.value").split(";");
                const staffId = data[0];
                const shiftId = data[1];
                //check if Staff Assignment is already on Change List
				if(c.get("v.unsavedChanges")){
                    let existingChangeSet = c.get("v.Changes");
                    if(existingChangeSet.filter( (c) => c.Shift__c == shiftId && c.Staff__c == staffId).length > 0) {
                        existingChangeSet = existingChangeSet.filter( (c) => !(c.Shift__c == shiftId && c.Staff__c == staffId));
                    }
                    c.set("v.Changes", existingChangeSet);
                    existingChangeSet.length == 0 && c.set("v.unsavedChanges", false);
                } else {
                    c.set("v.Changes", [c.get("v.allStaffShiftAssignments").get(shiftId)]);
                    c.set("v.unsavedChanges", true);
                }
                //remove Shift Assignment
                let assa = c.get("v.allStaffShiftAssignments");
                assa.delete(shiftId);
                c.set("v.allStaffShiftAssignments",assa);
                //remove SE field from boothList
                let bl = Array.from(c.get("v.allBooths").values());
                bl = bl.map( (b) => {
                    for(let s of b.Shifts__r){
                    if(s.Id == shiftId){
                    	s["SE"] = undefined}
                		
                    }
            		return b
                	});
        		c.set("v.boothList",bl);
            	//remove SE field from allBooths
                c.set("v.allBooths",new Map(bl.map( (b) => ([b.Id,b]))));
                
            },
    typeFilter : function(c,e,h){
        const value = e.target.value;
        c.set("v.showMenuListFiltered",c.get("v.showMenuList").filter( (li) => li.Name.toUpperCase().includes(value.toUpperCase())));
    }
})