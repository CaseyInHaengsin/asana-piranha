project = window.location.pathname.split('/')[2];
base = 'https://app.asana.com/api/1.0/';


// (function() {
// 	if(!chrome.runtime.error){
// 		manifest = chrome.runtime.getManifest();
// 		client_name = ['chrome-extension', manifest.version, manifest.name].join(':'); // Be polite to Asana API
// 	}
// })


$.ajaxSetup({
	beforeSend: function(xhr) {
		xhr.setRequestHeader('X-Allow-Asana-Client', '1');
	}
});


import_link = '<div class="TopbarPageHeaderGlobalActions-omnibutton">                                                         	   \
                    <select class="Button Button--small" id="template-menu">                                                       \
                      <option></option>                                                                                            \
                      <option value="1115963254384170">Arc Microtemplate</option>                                                  \
                      <option value="1115958280217388">Gauge Microtemplate</option>                                                \
                      <option value="1115958280217459">Catalog Microtemplate</option>                                              \
                   </select>                                                                                                       \
                   <button class="Button Omnibutton Button--primary Button--small" id="template-button">Import</button>            \
               </div>'
                   
                   
function getTasks () {
	$('#template-button').click(function(){
		projectId = $('#template-menu').find(":selected").attr('value');
		if (projectId == undefined){
			alert("Please select a template before importing");
		} else {
			//console.log(projectId);
			url = base + 'projects/' + projectId + '/tasks?opt_pretty&opt_expand=html_notes&opt_expand=this'
      $.get({url}, function(response){
        tasks = response.data
        createTasks(tasks)
      })
		}
	});
}


function createTasks(tasks) {
	// for(var i = tasks.length-1; i >= 0; i--) {
	if(tasks.length > 0){
		task = tasks.pop();
		taskName = task.name
		htmlNotes = task.html_notes
		taskFields = task.custom_fields
		customFields = {};
		
		$.each(taskFields, function(){
			customId = this.id
			customType = this.enum_value
			
			if (customType != null){
				customValue = JSON.stringify(this.enum_value.id)
				customFields[customId] = customValue;
			} else {
				console.log('Custom field value null {' + customId + ': null} for: '+ taskName);
			}
		});
		createTask(taskName,project,htmlNotes,customFields,function(){
			console.log("Created a task names", taskName);
			createTasks(tasks);
		},function(){
			console.log("Failed to create a task!",taskName);
		});
	} else {
		console.log("Done creating tasks");
	}
}

function createTask(taskName,project,htmlNotes,customFields,onSuccess,onFail){
	url = base + 'tasks'
	$.post({
		url,
		data: {
			"name": taskName,
			"projects": project,
			"assignee": "me",
			"html_notes": htmlNotes,
			"custom_fields": customFields 
			}
	}).done(function(){
		onSuccess();
	}).fail(function(){
		onFail();
	});
}


$(document).ready(function(){
	$(".Omnibutton").after(import_link);	//add import button
	//console.log("Current project id: " + project);
	getTasks ();
});