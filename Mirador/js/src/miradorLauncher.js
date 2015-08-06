window.Mirador = window.Mirador || {};

// DONE: Launcher - Encode URL
// DONE: Support for global Service Manager class
(function($) {


	$.launch = function(configUrl) {
		var manifests = [];
		var opts = {};
		var url = '';

		$.readConfigFromUrl(configUrl)
		.done(function(data) { 
			$.getManifests(manifests)
			.done(function(data) { 
					console.log("DONE");
				});
			})
		.done(function() {
			console.log("Launching mirador...");
			Mirador({
		        "id": "viewer",
		        "layout": "1x1",
		        "data": manifests,
		        "windowObjects": []
		      });

		});

	};

	$.getManifests = function(manifests) {
		url = $.ServiceManager.getUrlForCommand('PictureHandler','list');
		console.log('Launcher - getting book names from server: ' + url);
		
		return jQuery.getJSON(url).done(function(data){
				
					jQuery.each(data, function(idx,name) {
				
						var curUrl = $.ServiceManager.getUrlForCommand('PictureHandler','get') + encodeURIComponent(name);
						manifests.push({manifestUri: curUrl});
						console.log('adding manifest for url: ' + curUrl );
				
					});
				})
				.fail(function() {
					console.log("Failed to fetch books!");
				});
	};

	$.readConfigFromUrl = function(url) {
		console.log("Mirador Launcher: fetching config from " + url);
		return jQuery.getJSON(url).done(function(configJson){
			/* Services config */
				jQuery.each(configJson.services, function(idx, serviceJson) {
					console.log("Mirador Launcher: adding service - " + serviceJson.name);
					$.ServiceManager.addServiceFromJson(serviceJson);
				});
		});

	};

})(Mirador);