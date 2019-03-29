pathname = window.location.pathname.split('/');
project = pathname[2];
var request;
var options;
var data;

var manifest = chrome.runtime.getManifest();
var client_name = ['chrome-extension', manifest.version, manifest.name].join(':'); // Be polite to Asana API
var requestData;

var requestUrl = 'https://app.asana.com/api/1.0/';

$.ajaxSetup({
  url: requestUrl,
  type: request,
  data: data,
  beforeSend: function(xhr) {
      xhr.setRequestHeader('X-Allow-Asana-Client', '1');
  }
});

var import_link = '<div class="TopbarPageHeaderGlobalActions-omnibutton">                                                          \
                    <select class="Button Button--small" id="template-menu">                                                     \
                      <option></option>                                                                                            \
                      <option value="1115963254384170">Arc Microtemplate</option>                                                  \
                      <option value="1115958280217388">Gauge Microtemplate</option>                                                \
                      <option value="1115958280217459">Catalog Microtemplate</option>                                              \
                   </select>                                                                                                       \
                   <button class="Button Omnibutton Button--primary Button--small" id="template-button">Import</button>            \
                   </div>'

//import button clicked, find selected value, get request for template
function updateLinks () {
  $('#template-button').click(function(){
    var projectId = $('#template-menu').find(":selected").attr('value');
    if(projectId == undefined){
      alert("Please select a template before importing");
    }
    else {
      //console.log(projectId);
      url = requestUrl + 'projects/' + projectId + '/tasks?opt_pretty&opt_expand=html_notes&opt_expand=this'
      $.get({url}, function(response){
        tasks = response.data
        //console.log(response)
        getTasks()
      })
    }
  });
}

//for each task get name, create task w/ name, and post to current project
function getTasks() {
  for(var i = tasks.length-1; i >= 0; i--) {
    taskFields = tasks[i].custom_fields
    customFields = {};

    $.each(taskFields, function(){
      customFieldId = this.id
      valueid = this.enum_value
      if(valueid == null){
        console.log('null enum value')
      }else {
        value_id = JSON.stringify(this.enum_value.id)
        customFields[customFieldId] = value_id;
      }
    })
  taskName = tasks[i].name
  htmlNotes = tasks[i].html_notes
  var url = requestUrl + 'tasks'
    $.post({url,
      data:{
        "name": taskName,
        "projects": project,
        "html_notes": htmlNotes,
        "custom_fields": customFields 
      }
    })
  } 
}


//onload - add link, log project, start updateLinks
$(document).ready(function(){
  $(".Omnibutton").after(import_link);
  //console.log(project);
  updateLinks ()
});



                      // <option value="1116024833220231">Data Provisioning (PTP Setup)</option>                                                   \
                      // <option value="973796920291340">"Data Provisioning (Manual)</option>                                                      \
                      // <option value="1116024833220138">Data Provisioning (SIF, 1R Setup)</option>                                               \
                      // <option value="1116024101635839">Data Provisioning (Skyward CSV)</option>                                                 \
                      // <option value="1116024101635747">Data Provisioning (SIStemic CSV)</option>                                                \
                      // <option value="1116023701545721">Data Provisioning (CSV & Automation)</option>                                            \
                      // <option value="1116021657718549">Change Management - Planning & Consultation</option>           \
                      // <option value="1116016074171105">Change Management - Onsite workshop and remote follow-up</option>              \
                      // <option value="1116014548445340">Change Management - Onsite workshop 1 day</option>                                    \
                      // <option value="1116014548445242">Adoption Consulting- Onsite workshop and remote follow-up</option>            \
                      // <option value="1116013856392175">Adoption Consulting - Onsite workshop 1 day or 10 day:</option>                        \
                      // <option value="1116012872578413">Change Management - Remote Consultation (no workshop):</option>                        \
                      // <option value="1116012152464297">Adoption Consulting - Remote Consultation (no workshop):</option>                      \
                      // <option value="1116021657718685">Custom Webinar Microtemplate</option>                                       \
                      // <option value="1116021657718617">Onsite Training Microtemplate</option>                                      \
                      // <option value="1115981715789000">Content Restructuring Microtemplate</option>                                \
                      // <option value="1115981715788932">Content White Glove Discovery Microtemplate</option>                        \
                      // <option value="1115978998354340">Content Instructional Design Consultation Microtemplate</option>            \
                      // <option value="1115978998354255">Content Course Evaluation Services Microtemplate</option>                   \
                      // <option value="1115967697253308">Content Custom Template Microtemplate</option>                              \
                      // <option value="1115972203093982">Content Curriculum Mgmt. Template Microtemplate</option>                    \