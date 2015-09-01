window.Mirador = window.Mirador || {};

// DONE: Launcher - Encode URL
// DONE: Support for global Service Manager class
(function($) {



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
			Mirador({
		        "id": "viewer",
		        "layout": "1x1",
		        "data": manifests,
		        "windowObjects": []
		      });
		});


		// Starts Launcher chained events
		jQuery.getJSON(configUrl).done(function(response) {
			$.loadConfigFromJson(response);
			loadConfig.resolve();
		});

	};

	$.parseAndAddManifestsURIs = function(manifests_arr) {
			manifests = [];

			jQuery.each(manifests_arr, function(idx,name) {
				
				var curUrl = $.ServiceManager.getUrlForCommand('PictureHandler','get') + encodeURIComponent(name);
				manifests.push({manifestUri: curUrl});
				console.log('Mirador Launcher: adding manifest for url: ' + curUrl );
				
			});

			return manifests;
	};

	$.loadConfigFromJson = function(configJson) {
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