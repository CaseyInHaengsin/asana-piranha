project = window.location.pathname.split('/')[2];
base = 'https://app.asana.com/api/1.0/';


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
        customFields(tasks)
      })
		}
	});
}

//loop through array one at a time, call itself to ensure the requests are synchronous (instead of using a for loop)
function customFields(tasks) {
	if(tasks.length > 0){
		task = tasks.pop();
		taskName = task.name
		notes = task.html_notes
		taskFields = task.custom_fields
		customFieldsArr = {};
		
		$.each(taskFields, function(){
			customId = this.id
			customType = this.enum_value
			
			if (customType != null){
				customValue = JSON.stringify(this.enum_value.id)
				customFieldsArr[customId] = customValue;
      }
      
		});
		createTask(taskName, notes, customFieldsArr, function(){
      //onSuccess
      console.log("Created a task! Task:", taskName);
      //call itself again on success for remaining tasks
      customFields(tasks);
      //onFail
		},function(){ 
			console.log("Failed creating a task! Task:", taskName);
		});
	} else {
		console.log("All done!");
	}
}


function createTask(taskName, notes, customFieldsArr, onSuccess, onFail){
	url = base + 'tasks'
	$.post({
		url,
		data: {
			"name": taskName,
			"projects": project,
			"assignee": "me",
			"html_notes": notes,
			"custom_fields": customFieldsArr
			}
	}).done(function(){
		onSuccess();
	}).fail(function(){
		onFail();
	});
}

// add import button in top nav, setup ajax requests
$(document).ready(function(){
  $(".Omnibutton").after(import_link);                              
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