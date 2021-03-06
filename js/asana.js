var baseUrl = "https://app.asana.com/api/1.0/";
var importLink = document.createElement("div");
    importLink.className = "TopbarPageHeaderGlobalActions-omnibutton"
    importLink.innerHTML = "<input id=\"import-input\" class=\"textInput textInput--medium asana-import\" placeholder=\"project...\" type=\"text\" role=\"combobox\" value=\"\">\
                            <select class=\"Button Button--small asana-import\" id=\"import-micro\">\
                              <option></option>\
                              <option value=\"1115963254384170\">Arc Microtemplate</option>\
                              <option value=\"1115958280217388\">Gauge Microtemplate</option>\
															<option value=\"1115958280217459\">Catalog Microtemplate</option>\
															<option value=\"1130770051555112\">Practice Microtemplate</option>\
                              <option value=\"1116021657718617\">Onsite Training</option>\
                              <option value=\"1116021657718685\">Custom Webinar</option>\
                              <option value=\"1116024833220231\">Data Prov: PTP</option>\
                              <option value=\"973796920291340\" >Data Prov: Manual</option>\
                              <option value=\"1116024833220138\">Data Prov: SIF, 1R</option>\
                              <option value=\"1116024101635839\">Data Prov: Skyward CSV</option>\
                              <option value=\"1116024101635747\">Data Prov: SIStemic CSV</option>\
                              <option value=\"1116023701545721\">Data Prov: CSV & Automation</option>\
                              <option value=\"1116014548445340\">Change Mgmt: 1 Day</option>\
                              <option value=\"1116016074171105\">Change Mgmt: 1 Day & Follow-Up</option>\
                              <option value=\"1116021657718549\">Change Mgmt: Planning & Cons.</option>\
                              <option value=\"1116012872578413\">Change Mgmt: Remote Cons.</option>\
                              <option value=\"1116014548445242\">Adoption: 1 Day & Follow-Up</option>\
                              <option value=\"1116013856392175\">Adoption: 1 or 10 Day</option>\
                              <option value=\"1116012152464297\">Adoption: Remote Cons.</option>\
                              <option value=\"1115967697253308\">Content: Custom</option>\
                              <option value=\"1115981715789000\">Content: Restructuring</option>\
                              <option value=\"1115972203093982\">Content: Curriculum Mgmt.</option>\
                              <option value=\"1115981715788932\">Content: White Glove Discovery </option>\
                              <option value=\"1115978998354340\">Content: Instructional Design Cons.</option>\
                              <option value=\"1115978998354255\">Content: Course Evaluation Services</option>\
                            </select>\
                            <button class=\"Button Omnibutton Button--primary Button--small asana-import\" id=\"import-button\">Import</button>";


// Get complete task list from /projects/projectId/tasks
var getTasks = function () { 
	$('#import-button').click(function(){
		projectId = $('#import-micro').find(":selected").attr('value');
		if (projectId == undefined) {
			alert("Please open a project and select a microtemplate to import.");
		} else {
			$('.asana-import').attr('disabled', true);
			url = baseUrl + 'projects/' + projectId + '/tasks?opt_expand=(custom_fields|html_notes|resource_subtype)'
      $.get({url}, function(response) {
        tasks = response.data
        customFields(tasks);
      });
		}
	});
}


//loop through array, call itself to ensure the requests are synchronous (instead of using a for loop)
var customFields = function (tasks) {
	if(tasks.length > 0){
		var task = tasks.pop();
		var taskName = task.name
		var taskFields = task.custom_fields

    var customFieldsArr = {};
    for(var k = 0; k < taskFields.length; k++) {
      customId = taskFields[k].id
      customType = taskFields[k].enum_value
			if (customType != null){
        customValue = customType.id
        //console.log(customId, customValue);
        customFieldsArr[customId] = customValue;
      }
    }
	
		var subType = task.resource_subtype
		var notes = task.html_notes
		var project = $('#import-input').val();

		if(subType == 'section'){
			dataArr = {
				"name": taskName,
				"projects": project
			}
		} else {
			dataArr = {
			"name": taskName,
			"projects": project,
			"html_notes": notes,
			"resource_subtype": subType,
			"custom_fields": customFieldsArr
			}
		}

		createTask(dataArr, function(){
			console.log("Created a task! Task:", taskName);  //onSuccess
      customFields(tasks); //onSuccess
		},function(){ 
			console.log("Failed creating a task! Task:", taskName);  //onFail
		});
	} else {
		console.log("All done!");
		$('.asana-import').attr('disabled', false);
	}
}

//create task, loop back through customFields on success
var createTask = function (dataArr, onSuccess, onFail){
	url = baseUrl + 'tasks'
	$.post({url, data: dataArr}).done(function(){
		onSuccess();
	}).fail(function(){
		onFail();
	});
}

$(document).ready(function(){
	$(".Omnibutton").after(importLink);
	if(!chrome.runtime.error){
		manifest = chrome.runtime.getManifest();
		client_name = ['chrome-extension', manifest.version, manifest.name].join(':'); //tell the asana api who we are
	}
	$.ajaxSetup({
		options: { client_name: client_name },                        
		beforeSend: function(xhr) {
			xhr.setRequestHeader('X-Allow-Asana-Client', '1');  //for browser session requests        
		}
	});                             
	//console.log("Current project id: ", project);
	getTasks();
});