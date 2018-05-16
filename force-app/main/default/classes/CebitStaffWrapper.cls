public class CebitStaffWrapper {
 @AuraEnabled public List<Staff__c> Staff { get; set; }
 @AuraEnabled public List<String> ConstraintOptions { get; set; }
 @AuraEnabled public List<String> SkillOptions { get; set; }
 @AuraEnabled public List<String> IndustryOptions { get; set; }


    // Trivial constructor, for server-side Apex -> client-side JavaScript
    public CebitStaffWrapper(List<Staff__c> staff) {
        this.Staff = staff;
        List<Schema.PicklistEntry> pick_list_values = Staff__c.Shift_Constraints__c.getDescribe().getPickListValues();
				List<String> constraintOptions = new List<String>();
				for(Schema.PicklistEntry p : pick_list_values){
					constraintOptions.add(p.getValue());
				}
        this.ConstraintOptions = constraintOptions;
        List<Schema.PicklistEntry> pick_list_values_cloud = Staff__c.Cloud__c.getDescribe().getPickListValues();
				List<String> SkillOptions = new List<String>();
				for(Schema.PicklistEntry p : pick_list_values_cloud){
					SkillOptions.add(p.getValue());
				}
        this.SkillOptions = SkillOptions;
        List<Schema.PicklistEntry> pick_list_values_industry = Staff__c.Industry__c.getDescribe().getPickListValues();
				List<String> IndustryOptions = new List<String>();
				for(Schema.PicklistEntry p : pick_list_values_industry){
					IndustryOptions.add(p.getValue());
				}
        this.IndustryOptions = IndustryOptions;
       }

    // Default, no-arg constructor, for client-side -> server-side
    public CebitStaffWrapper() {}
}