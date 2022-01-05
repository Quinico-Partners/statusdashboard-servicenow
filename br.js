(function executeRule(current, previous /*null when async*/) {

    var webhook_key = 'INSERT';  // StatusDashboard Webhook Key
    var debug = false;
    var statusdashboard_endpoint = 'https://www.statusdashboard.com/webhooks/servicenow/';
	
    try {
        var r = new sn_ws.RESTMessageV2();
        r.setEndpoint(statusdashboard_endpoint + webhook_key + '/');
        r.setHttpMethod("post");

        var sys_id = current.getValue('sys_id');
        var state = current.getValue('state');
        var business_service = current.getValue('business_service');
        var description = current.getValue('description');
        var impacted_services = [];

        // Get all impacted services
        var gr = new GlideRecord('task_cmdb_ci_service');
        gr.addQuery('task', current.sys_id);
        gr.query();
        while (gr.next()) {
            if (debug == true) {gs.info('Related CI found (name): ' + gr.cmdb_ci_service.name);}
            if (debug == true) {gs.info('Related CI found (sys_id): ' + gr.cmdb_ci_service.sys_id);}
            impacted_services.push(gr.cmdb_ci_service.sys_id.toString());
        }

        var obj = {
            'sys_id': sys_id,
            'state': state,
            'event_type': 'incident',
            'business_service': business_service,
            'description': description,
            'impacted_services': impacted_services
        };
		
        var body = JSON.stringify(obj);
        if (debug == true) {gs.info('Webhook body: ' + body);}
               
        // Add the body to the request
        r.setRequestBody(body);

        var response = r.execute();
        var httpStatus = response.getStatusCode();
    } catch (ex) {
        var message = ex.message;
        gs.error('Error message: ' + message);
    }

    if (debug == true) {gs.info('Webhook target HTTP status response: ' + httpStatus);}

})(current, previous);
