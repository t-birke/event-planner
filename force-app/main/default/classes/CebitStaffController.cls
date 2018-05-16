public class CebitStaffController {
	@AuraEnabled
	public static CebitStaffWrapper getStaff(String type){
			List<Staff__c> staff = [SELECT Id, Name, Available__c, Cloud__c, Industry__c, Function__c, is_manager__c, Manager__c, Shift_Constraints__c FROM Staff__c WHERE Function__c = :type ORDER BY Last_Name__c ASC NULLS FIRST];
		return new CebitStaffWrapper(staff);
	}

	@AuraEnabled
	public static CebitStaffWrapper updateStaff(String type, List<Staff__c> staffUpdate){
		update staffUpdate;
		List<Staff__c> staff = [SELECT Id, Name, Available__c, Cloud__c, Industry__c, Function__c, is_manager__c, Manager__c, Shift_Constraints__c FROM Staff__c WHERE Function__c = :type ORDER BY Last_Name__c ASC NULLS FIRST];
		return new CebitStaffWrapper(staff);
	}
}