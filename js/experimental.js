//experimental.js - vanilla js testing
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
                              <option value=\"1115960415944898\">Custom URL</option>\
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

//get complete task list for templates
var getTasks = function () {
  document.getElementById('import-button').onclick = function () {
    x = document.getElementsByClassName("asana-import");
    for (var i = 0; i < x.length; i++) {
      x[i].setAttribute("disabled", true)
    }
    var selector = document.getElementById('import-micro');
    var projectId = selector[selector.selectedIndex].value;
		if (projectId != '') {
      callAsanaApi('GET', `projects/${projectId}/tasks`, {'opt_expand': '(custom_fields|html_notes|resource_subtype)'}, {}, function (response) {
        var tasks = response.data;
        //console.log('response', tasks);
        customFields(tasks);
      });
  	}
  }
}

var customFields = function (tasks) {
	if(tasks.length > 0){
		var task = tasks.pop();
		var taskName = task.name
		var taskFields = task.custom_fields
   
    var customFieldsArr = {};
    for(var k = 0; k < taskFields.length; k++) {
      var customId = taskFields[k].id
      var customType = taskFields[k].enum_value
			if (customType != null) {
        customValue = customType.id
        //console.log(customId, customValue);
        customFieldsArr[customId] = customValue;
      }
    }
	
		var subType = task.resource_subtype
		var notes = task.html_notes
    var input = document.getElementById('import-input');
    var project = input.value;

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

		createTask(dataArr, function () {
      //console.log("Created a task! Task:", taskName);  //onSuccess
      customFields(tasks);
		},function () { 
			console.log("Failed creating a task! Task:", taskName);  //onFail
		});
	} else {
		console.log("All done!");
    for (var i = 0; i < x.length; i++) {
      x[i].removeAttribute("disabled");
    }
	}
}

//create task, loop back through customFields onSuccess
var createTask = function (dataArr, onSuccess, onFail) {
  callAsanaApi('POST', `tasks`, {}, dataArr, function () {
    if (status >= 200 && status < 300) {
      onSuccess();
    } else {
      onFail();
    }
  });
}

//first load/page reload 
window.addEventListener('load', function () {
  //console.log("experimental.js loaded");
  var avatar = document.getElementsByClassName('TopbarPageHeaderGlobalActions-settingsMenuButton')[0];
  document.getElementsByClassName('TopbarPageHeaderGlobalActions')[0].insertBefore(importLink, avatar);
	getTasks();
});

//asana api
var callAsanaApi = function (request, path, options, data, callback) {
  var xhr = new XMLHttpRequest();
  xhr.addEventListener('load', function () {
    callback(JSON.parse(this.response));
  });
  xhr.onreadystatechange = function () {
    status = xhr.status;
    return status;
  };
  var manifest = chrome.runtime.getManifest();
  var client_name = ['chrome-extension', manifest.version, manifest.name].join(':'); // Be polite to Asana API
  var requestData;
  if (request === 'POST' || request === 'PUT') {
    requestData = JSON.stringify({'data': data});
    options.client_name = client_name;
  } else {
    options.opt_client_name = client_name;
  }
  var requestUrl = 'https://app.asana.com/api/1.0/' + path;
  if (Object.keys(options).length) {
    var parameters = '';
    for (var key in options) {
      if (options.hasOwnProperty(key)) {
        parameters += [key, '=', options[key], '&'].join('');
      }
    }
    parameters = parameters.slice(0, -1);
    requestUrl += '?' + parameters;
  }
  xhr.open(request, encodeURI(requestUrl));
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('X-Allow-Asana-Client', '1'); // Required to authenticate for POST & PUT
  xhr.send(requestData);
};