public class CebitShiftWrapper {
 @AuraEnabled public List<Staff__c> Staff { get; set; }
 @AuraEnabled public List<Booth__c> BoothList { get; set; }
 @AuraEnabled public List<Staff_on_Shift__c> StaffShiftList {get; set; }
 @AuraEnabled public List<String> areaFilterOptions {get; set; }
 @AuraEnabled public List<String> sectionFilterOptions {get; set; }


    // Trivial constructor, for server-side Apex -> client-side JavaScript
    public CebitShiftWrapper(List<Staff__c> staff, List<Booth__c> boothList, List<Staff_on_Shift__c> StaffShiftList) {
        this.Staff = staff;
        this.BoothList = boothList;
        this.StaffShiftList = StaffShiftList;
        Set<String> afo = new Set<String>();
        Set<String> sfo = new Set<String>();
        for(Booth__c b : boothList){
            sfo.add(b.Section__r.Name);
            afo.add(b.Section__r.Area__r.Name);
        }
        this.areaFilterOptions = new List<String>(afo);
        this.sectionFilterOptions = new List<String>(sfo);
       }

    // Default, no-arg constructor, for client-side -> server-side
    public CebitShiftWrapper() {}
    
}