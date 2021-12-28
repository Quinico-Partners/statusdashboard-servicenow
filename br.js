(function executeRule(current, previous /*null when async*/) {

    var debug = false;
	
    try {
        var r = new sn_ws.RESTMessageV2();
        r.setEndpoint("https://www.statusdashboard.com/webhooks/servicenow/<INSERT WEBHOOK KEY>/");
        r.setHttpMethod("post");

        var sys_id = current.getValue("sys_id");
        var state = current.getValue("state");
        var business_service = current.getValue("business_service");
        var description = current.getValue("description");
        var impacted_services = [];

        // Get all impacted services
        var gr = new GlideRecord('task_cmdb_ci_service');
        gr.addQuery('task', current.sys_id);
        gr.query();
        while (gr.next()) {
            gs.info("Related CI found (name): " + gr.cmdb_ci_service.name);
            gs.info("Related CI found (sys_id): " + gr.cmdb_ci_service.sys_id);
            impacted_services.push(gr.cmdb_ci_service.sys_id.toString());
        }

        var obj = {
            "sys_id": sys_id,
            "state": state,
            "business_service": business_service,
            "description": description,
            "impacted_services": impacted_services
        };
		
        var body = JSON.stringify(obj);
        gs.info("Webhook body: " + body);
               
        // Add the body to the request
        r.setRequestBody(body);

        var response = r.execute();
        var httpStatus = response.getStatusCode();
    } catch (ex) {
        var message = ex.message;
		gs.error("Error message: " + message);
    }

    gs.info("Webhook target HTTP status response: " + httpStatus);

})(current, previous);
