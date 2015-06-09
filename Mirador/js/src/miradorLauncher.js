window.Mirador = window.Mirador || {};

// DONE: Launcher - Encode URL
// DONE: Support for global Service Manager class
(function($) {


	$.launch = function() {
		var manifests = [];
		var opts = {};
		var url = '';


		url = $.ServiceManager.getUrlForCommand('PictureHandler','list');

		console.log('Launcher - getting book names from server: ' + url);
		jQuery.getJSON(url).done(function(data){
			jQuery.each(data, function(idx,name) {
				var curUrl = $.ServiceManager.getUrlForCommand('PictureHandler','get') + encodeURIComponent(name);
				manifests.push({manifestUri: curUrl});
				console.log('adding manifest for url: ' + curUrl );
			});
			console.log('launching mirador');
			Mirador({
		        "id": "viewer",
		        "layout": "1x1",
		        "data": manifests,
		        "windowObjects": []
		      });
		});

	};

})(Mirador);