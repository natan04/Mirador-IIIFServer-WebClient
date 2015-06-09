window.Mirador = window.Mirador || {};
window.Mirador.ServiceManager = window.Mirador.ServiceManager || {};

// DONE: Add global manifest service manager
// TODO: Service Manager - Move initial config to somewhere else(maybe Launcher? maybe index.html?)
(function($){

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

	$.services = {};


	// Initial config for manifest service
	$.addService('PictureHandler','http://localhost:8080',
		{ list: 'Json?id=all', 
		  upload: 'Upload',
		  get: 'Json?id='
	});


})(Mirador.ServiceManager);
