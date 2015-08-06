window.Mirador = window.Mirador || {};

// DONE: Launcher - Encode URL
// DONE: Support for global Service Manager class
(function($) {


	$.launch = function(configUrl) {
		var manifests = [];
		var opts = {};
		var url = '';
		var loadConfig = new jQuery.Deferred();
		var loadManifests = new jQuery.Deferred();

		// When config is done: Load manifests
		loadConfig.done(function() {
			var url = $.ServiceManager.getUrlForCommand('PictureHandler','list');
			
			console.log('Mirador Launcher: getting book names from server: ' + url);
			
			// Request book names from PictureHandler
			jQuery.getJSON(url)
			.done(function(response) {
				manifestsURLs = $.parseAndAddManifestsURIs(response);
				loadManifests.resolve(manifestsURLs);
			})
			.fail(function(){
				console.log("Mirador Launcher: Failed to fetch books! continuing with empty list");
				loadManifests.resolve([]);
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


	// $.getManifests = function(manifests) {
	// 	url = $.ServiceManager.getUrlForCommand('PictureHandler','list');
	// 	console.log('Mirador Launcher: getting book names from server: ' + url);
		
	// 	return jQuery.getJSON(url).done(function(data){
	// 				jQuery.each(data, function(idx,name) {
				
	// 					var curUrl = $.ServiceManager.getUrlForCommand('PictureHandler','get') + encodeURIComponent(name);
	// 					manifests.push({manifestUri: curUrl});
	// 					console.log('Mirador Launcher: adding manifest for url: ' + curUrl );
				
	// 				});
	// 			})
	// 			.fail(function() {
	// 				console.log("Mirador Launcher: Failed to fetch books! continuing with empty list");
	// 			});
	// };



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
			});

	};

})(Mirador);