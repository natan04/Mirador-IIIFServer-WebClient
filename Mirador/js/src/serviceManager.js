window.Mirador = window.Mirador || {};

/**
 * ServiceManager library/namespace. holds Service class and global services object.
 * @namespace
 */
window.Mirador.ServiceManager = window.Mirador.ServiceManager || {};


(function($){

	/**
	 * Represents a remote service
	 * @memberOf window.Mirador.ServiceManager
	 * @constructor
	 * @param {Object} options - describes config for the service.  default ones: "name", "baseUrl". every service has its own parameters.
	 */
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
		/**
		 * get full url for given command name
		 * @param  {string} cmd - command name
		 * @return {string}  full URL string for given command
		 */
		getUrlForCommand: function(cmd) {
			return this.baseUrl + '/' + this.name + '/' + this.cmds[cmd];
		}
	};


	$.getUrlForCommand = function(service, cmd) {
		return $.services[service].getUrlForCommand(cmd);
	};

	/**
	 *  Add service to the global services object
	 * @memberof  window.Mirador.ServiceManager
	 * @param {string} name  - service name
	 * @param {string} baseUrl - service baseUrl
	 * @param {Object[]} cmds - service commands (array of cmd objects)
	 */
	$.addService = function(name,baseUrl,cmds) {
		$.services[name] = new $.Service(name,baseUrl,cmds);
	};

	/**
	 * Parse given JSON to service object and add it to global services object
	 * @memberof  window.Mirador.ServiceManager
	 * @param {Object} serviceJson
	 */
	$.addServiceFromJson = function(serviceJson) {
		$.addService(serviceJson.name, serviceJson.baseUrl,serviceJson.cmds);
	};

	/**
	 * Global services object. used for centralizing all the services in one place for easy access.
	 * @memberOf window.Mirador.ServiceManager
	 * @type {Object}
	 */
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
