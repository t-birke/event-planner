({
    lazyLoadTabs: function (c, e) {
        var tab = e.getSource();
        switch (tab.get('v.id')) {
            case 'skills' :
                this.injectComponent('c:CebitSkillOverview', tab);
                break;
            case 'overview' :
                this.injectComponent('c:CebitStaffingOverview', tab);
                break;
           	case 'industry' :
                this.injectComponent('c:CebitIndustryOverview', tab);
                break;
            case 'constraints' :
                this.injectComponent('c:CebitStaffGrid', tab);
                break;
            case 'assign' :
                this.injectComponent('c:CebitShiftAssignment', tab);
                break;
        }
    },
    injectComponent: function (name, target) {
        $A.createComponent(name, {
        }, function (contentComponent, status, error) {
            if (status === "SUCCESS") {
                target.set('v.body', contentComponent);
            } else {
                throw new Error(error);
            }
        });
    }
})