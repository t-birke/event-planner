({
    init : function(c,e,h){
        h.buildLists(c);
		const action = c.get("c.getData");
        action.setParams({type: "SE"});
        action.setCallback(this, function(response) {
	    const state = response.getState();
	    if(state === "SUCCESS") {
				console.log(response.getState());
				const data = response.getReturnValue();
            //should return
            //	Staff
            //	BoothList
            //	StaffShiftList
            	h.formatFilterOptions(c,data);
				                
            c.set("v.allStaff",new Map(data.Staff.map( (s) => {
                if(s.Cloud__c){
                	const sc = s.Cloud__c.split(";");
                	for(const sce of sc){
                            s[sce] = true;
                        }
           		}
                if(s.Industry__c){
                	const ind = s.Industry__c.split(";");
                	for(const ice of ind){
                            s[ice] = true;
                        }
           		}
            	s["All"] = true;
                if(s.Shift_Constraints__c){
				const sC = s.Shift_Constraints__c.split(";");
				for(const sce of sC){
					s['c' + sce] = true;
				}
				}
                return [s.Id,s]})));
            	const assa = new Map(data.StaffShiftList.map( (s) => ([s.Shift__r.Id,s])));
                c.set("v.allStaffShiftAssignments",assa);
            	const bl = data.BoothList.map( (b) => {
                    //set Skill Fields
                    if(b.Required_Function__c){
                    	const bR = b.Required_Function__c.split(";");
                        for(const bre of bR){
                            b[bre] = true;
                        }
                    }
                    //set SE on Shift if existing
                    for(let s of b.Shifts__r){
                        const a = assa.get(s.Id);
            			a && (s["SE"] = {Name:a.Staff__r.Name,Id:a.Staff__r.Id}); 
                    }
                    return b;
				});
            	c.set("v.boothList",bl);
            	c.set("v.allBooths",new Map(bl.map( (b) => ([b.Id,b]))));
    			let mfo = data.Staff.filter( (s) => s.is_manager__c == true).map( (s) => ({ value: s.Id, label: s.Name})).concat([{value: "all", label: "all"}]);
    			c.set("v.managerFilterOptions",mfo);
            	$A.util.toggleClass(c.find("ShiftAssignmentGridSpinner"),"slds-hide");
				$A.util.toggleClass(c.find("ShiftAssignmentGrid"),"slds-hide");
        c.set("v.readyForToggleCheck",true);
	    }
	    else if (state === "ERROR") {
	      const error = response.getError();
	      console.log("Error with Cebit Shift Controller -> " + error[0].getMessage);
	    }
	    else {
	      console.log('Unknown problem, response state: ' + state);
	    }
   	});
    $A.enqueueAction(action);
    },
	buildLists : function(c) {
		const shiftModel = [
            {date: "2018-06-12", dayNumber: 1, shifts: [{number:1,start:"10:00",end:"12:30"},{number:2,start:"12:20",end:"15:00"},{number:3,start:"14:50",end:"17:00"},{number:4,start:"16:50",end:"19:00"}]},
            {date: "2018-06-13", dayNumber: 2, shifts: [{number:1,start:"10:00",end:"12:30"},{number:2,start:"12:20",end:"15:00"},{number:3,start:"14:50",end:"17:00"},{number:4,start:"16:50",end:"19:00"}]},
            {date: "2018-06-14", dayNumber: 3, shifts: [{number:1,start:"10:00",end:"12:30"},{number:2,start:"12:20",end:"15:00"},{number:3,start:"14:50",end:"17:00"},{number:4,start:"16:50",end:"19:00"}]},
            {date: "2018-06-15", dayNumber: 4, shifts: [{number:1,start:"10:00",end:"12:30"},{number:2,start:"12:20",end:"15:00"},{number:3,start:"14:50",end:"17:00"}]}
        ];
        const stfo = [
            { value: "AE", label: "AE"},
            { value: "SE", label: "SE"}
        ];
        const dfo = [
            { value: "2018-06-12", label: "Tuesday (12.06.2018)"},
            { value: "2018-06-13", label: "Wednesday (13.06.2018)"},
            { value: "2018-06-14", label: "Thursday (14.06.2018)"},
            { value: "2018-06-15", label: "Friday (15.06.2018)"}
        ];
        c.set("v.daysWithShifts", shiftModel);
        c.set("v.staffTypeFilterOptions", stfo);
        c.set("v.dateFilterOptions", dfo);
	},
    formatFilterOptions : function(c,data) {
		c.set("v.areaFilterOptionsAll", data.areaFilterOptions.map( (s) => ({ value: s, label: s})).concat([{value: "all", label: "all"}]));
        c.set("v.sectionFilterOptionsAll", data.sectionFilterOptions.map( (s) => ({ value: s, label: s})).concat([{value: "all", label: "all"}]));
        c.set("v.areaFilterOptions",c.get("v.areaFilterOptionsAll"));
        c.set("v.sectionFilterOptions",c.get("v.sectionFilterOptionsAll"));
	},
})