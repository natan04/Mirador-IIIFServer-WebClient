window.Mirador = window.Mirador || {};
/**
 * @namespace window.Mirador
 */
(function($) {

	/**
	 * Default config for launching mirador. can be overriden by external config-json
	 * @memberof window.Mirador
	 * @type {Object}
	 */
	$.customConfig = {
		        "id": "viewer",
		        "layout": "1x1",
		        "windowObjects": []
	};

	/**
	 * Launches mirador with given config-json URL and custom manifests data. the loading sequence is synchronous:<br>
	 * ** 1) Loads config-json from configUrl<br>
	 * ** 2) Parses config-json and adds the relevant config(mostly services parameters) to global mirador config<br>
	 * ** 3) Loads remote manifests  descriptions from PictureHandler and add to global mirador config<br>
	 * ** 4) Launch Mirador with loaded config(manifests & services)<br>
	 * @param  {string} configUrl  - URL to config-json
	 * @param  {Object[]} customData - array of manifest description objects for entering external manifests (not from PictureHandler)
	 * @param {string} customData[].manifestUri - full URL to manifest
	 * @param {string} customData[].location - Manifest institution (example: "Harvard University", "Stanford University")
	 * @memberof window.Mirador
	 */
	$.launch = function(configUrl,customData) {
		var manifests = [];
		var opts = {};
		var url = '';
		var loadConfig = new jQuery.Deferred();
		var loadManifests = new jQuery.Deferred();

		// When config is done: Load manifests
		loadConfig.done(function() {
			var url = $.ServiceManager.getUrlForCommand('PictureHandler','list');
			
			console.log('Mirador Launcher: getting book names from server: ' + url);
			
			var ajaxObj = {
				dataType: 'json',
				url: url,
				timeout: 1000,
				xhrFields: {
				      withCredentials: true
				   }
			};

			// Request book names from PictureHandler
			jQuery.ajax(ajaxObj)
			.done(function(response) {
				manifestsURLs = $.parseAndAddManifestsURIs(response);
				Array.prototype.push.apply(manifestsURLs, customData); // Chaining custom data array with fetched books
				loadManifests.resolve(manifestsURLs);
			})
			.fail(function(){
				console.log("Mirador Launcher: Failed to fetch books! continuing with only custom data");
				loadManifests.resolve(customData);
			});
		});

		// When Manifests parsing done: Load Mirador
		loadManifests.done(function(manifests){
			console.log("Mirador Launcher: Launching mirador...");
			$.customConfig.data = manifests;

			Mirador($.customConfig);
		});


		// Starts Launcher chained events
		jQuery.getJSON(configUrl).done(function(response) {
			$.loadConfigFromJson(response);
			loadConfig.resolve();
		});

	};

	/**
	 * Parses manifest IDs and constructs a list of manifest description objects
	 * @param  {string[]} manifests_arr - Array of manifests IDs (located in PictureHandler)
	 * @return {Object[]} Array of manifest description objects
	 * @memberof window.Mirador
	 */
	$.parseAndAddManifestsURIs = function(manifests_arr) {
			manifests = [];

			jQuery.each(manifests_arr, function(idx,name) {
				
				var curUrl = $.ServiceManager.getUrlForCommand('PictureHandler','get') + encodeURIComponent(name);
				manifests.push({manifestUri: curUrl});
				console.log('Mirador Launcher: adding manifest for url: ' + curUrl );
				
			});

			return manifests;
	};

	/**
	 * Adds services to global mirador services object from given config-json
	 * @param  {Object} configJson - config-json JSON object
	 * @return {} nothing
	 * @memberof window.Mirador
	 */
	$.loadConfigFromJson = function(configJson) {
			jQuery.extend(true, $.customConfig, configJson.customConfig);

			/* Services config */
			jQuery.each(configJson.services, function(idx, serviceJson) {
				console.log("Mirador Launcher config: adding service - " + serviceJson.name);
				$.ServiceManager.addServiceFromJson(serviceJson);
				
				if (serviceJson.name == "InvokerService") {
					$.ServiceManager.services.invoker = new window.InvokerLib.InvokerService(serviceJson);
				}
			});

	};

})(Mirador);