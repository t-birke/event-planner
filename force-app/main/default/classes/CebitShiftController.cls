public class CebitShiftController {
	@AuraEnabled
	public static CebitShiftWrapper getData(String type){
			List<Staff__c> staff = [SELECT Id, Name, Available__c, Cloud__c, Industry__c, Function__c, is_manager__c, Manager__c, Shift_Constraints__c FROM Staff__c WHERE Function__c = :type ORDER BY Last_Name__c ASC NULLS FIRST];
        	List<Booth__c> boothList = [SELECT Id, 
                                        		Name, 
                                        		Booth_Name__c, 
                                        		Cloud_Focus__c, 
                                        		Required_Function__c, 
                                        		Industry__c,
                                        		Section__r.Name, 
                                        		Section__r.Area__r.Name,
                                        		(Select Id, Date__c, Start__c, End__c, Shift_Order__c 
                                                 From Shifts__r
                                                ORDER BY Shift_Order__c ASC NULLS FIRST)
                                        FROM Booth__c
                                       	ORDER BY Name ASC NULLS FIRST];
        	List<Staff_on_Shift__c> staffShiftList = [SELECT Id, Shift__r.Shift_Order__c, Shift__r.Date__c, Staff__r.Name FROM Staff_on_Shift__c];
		return new CebitShiftWrapper(staff, boothList,staffShiftList);
	}
    
    @AuraEnabled
    public static Boolean updateStaffAssignment(List<Staff_on_Shift__c> addAssignments, List<Staff_on_Shift__c> removeAssignments){
			insert addAssignments;
        	delete removeAssignments;
		return true;
    }
}