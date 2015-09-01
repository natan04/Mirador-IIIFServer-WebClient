window.Mirador = window.Mirador || {};
window.Mirador.ServiceManager = window.Mirador.ServiceManager || {};

// DONE: Add global manifest service manager
// DONE: Service Manager - Move initial config to somewhere else(in mirador-config.json)
(function($){

	$.Service = function(options) {
		jQuery.extend(true, this, {
			name: '',
			baseUrl: 'http://localhost:5000',
		},options);
	};


	$.Service = function(name,baseUrl,cmds) {
		this.name = name;
		this.baseUrl = baseUrl;
		this.cmds = cmds;
	};

	$.Service.prototype = {
		getUrlForCommand: function(cmd) {
			return this.baseUrl + '/' + this.name + '/' + this.cmds[cmd];
		}
	};


	$.getUrlForCommand = function(service, cmd) {
		return $.services[service].getUrlForCommand(cmd);
	};

	$.addService = function(name,baseUrl,cmds) {
		$.services[name] = new $.Service(name,baseUrl,cmds);
	};

	$.addServiceFromJson = function(serviceJson) {
		$.addService(serviceJson.name, serviceJson.baseUrl,serviceJson.cmds);
	};

	$.services = {};


	$.ServicePictureHandler = function() {
		return 0;
	};


	// Initial config for manifest service
	//$.addService('PictureHandler','http://132.72.46.235:8080/',
	//	{ list: 'Json?id=all', 
	//	  upload: 'Upload',
	//	  get: 'Json?id='
	//});


})(Mirador.ServiceManager);
