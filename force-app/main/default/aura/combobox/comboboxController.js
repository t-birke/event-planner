({
	handleClick : function(c, e, h) {
		let ev = c.getEvent("addStaff");
        ev.setParams({"staffId" : e.currentTarget.dataset.name, "shiftId" : c.get("v.shiftId")});
        ev.fire();
	}
})