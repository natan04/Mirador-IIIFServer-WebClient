window.InvokerLib = window.InvokerLib || {};
window.InvokerLib.Models = window.InvokerLib.Models || {};

// DONE: Added Invoker models classes (Function,Parameter,Class, InvokeRequest, Invoke)
// DONE: Added simple dummy requests functions



/*
	ENTER INTO EDIT MODE (HANDSHAKE):
		1.User selects canvas(image) & clicks "EDIT"
		2.Mirador sends "Edit Handshake" to Invoker:
					{
						type: 'edit',
						images: [<image_canvas_id> - for example: "aaa/default/blabla.jpg"]
					}

		3.Invoker sends special "edit mode" manifest for specific images
	
		4.Mirador presents "edit mode" manifest on new imageView window

	FOR EVERY FUNCTION INVOKE(INSIDE EDITOR IMAGEVIEW):
		1.User selects function/class/parameters
		2.Mirador sends regular invokeRequest to invoker:
				previewKey - index of current selected image (from thumbnails array)
				baseImage - Original image id
		3.Invoker sends back new "edit mode" manifest	

 */




/* ------------------------------------------------------ */
/*  			Models									  */
/* ------------------------------------------------------ */

(function($,ServiceManager) {


	$.Parameter = function(name, type, description) {
		return {
			name: name,
			type: type,
			description: description
		};
	};

	$.Class = function(name, description, parameters) {
		return {
			name: name,
			description: description,
			parameters: parameters || []
		};
	};

	$.Function = function(name, input, output, classes) {
		return {
			name: name,
			input: input,
			output: output,
			classes: classes || []
		};
	};

	$.Invoke = function(func_name, class_name, parameters){
		return {
			function: func_name,
			class: class_name,
			parameters: parameters || []
		};
	};

	$.InvokeRequest = function(options) {
		jQuery.extend(true, this, {
			type: 'preview',
			invokes: {},
			images: [],
			baseImage: '',
			previewKey: 0
		},options);

	};

	$.InvokeRequest.prototype = {
		addInvoke: function(invoke) {
			var max_key = Math.max.apply({},Object.keys(this.invokes));

			if (jQuery.isEmptyObject(this.invokes)) {
				max_key = 0;
			} else {
				max_key = max_key + 1;
			}

			this.invokes[max_key.toString()] = invoke;

			return this;
		}


	};



})(window.InvokerLib.Models);



(function($,ServiceManager) {



	$.createDummy = function(r_type) {
		var req = new $.Models.InvokeRequest({type: r_type});
		
		var inv = $.Models.Invoke('Binarizer','Threshold');
		inv.parameters.push({name:"level", value:"20"});
		inv.parameters.push({name:"reverse", value:"true"});
		req.addInvoke(inv);

		inv = $.Models.Invoke('Ahalanizer','Blabla');
		inv.parameters.push({name:"ppp", value:"127"});
		inv.parameters.push({name:"aaa", value:"23.5"});
		req.addInvoke(inv);


		req.baseImage= 'achbar/default/11655127_10153432370269337_1461771407_n.jpg';


		return req;

	};

	$.sendDummy = function(url, sendWhat,r_type) {

		if (!sendWhat) {
			sendWhat = $.createDummy(r_type);
		}

		console.log('Invoker: dummy request initiated - url: ' + url);
		
		ServiceManager.services.invoker.sendRequest(sendWhat, function(json,status){
				console.log('Invoker: dummy request success - status ' + status + ', data:');
		 		console.log(JSON.stringify(json));
		},function(jqXHR,status,error){
			  console.log('Invoker: dummy request FAILED - status ' + status + ', error ' + error);

		});


	};


	$.InvokerService = function(options) {
		jQuery.extend(true, this,
		{
			baseUrl: 'http://localhost:5000',
			servicePath: 'PictureHandler/Invoker',
			ajaxOpts: {type: "POST", dataType: "json", xhrFields: {withCredentials: true} }
		},options);

	};

	$.InvokerService.prototype = {

		sendRequest: function(invokeReq,successCallback, failCallback,url){
			var ajaxObj = jQuery.extend(true, {
									success: successCallback,
									error: failCallback,
									url: url || (this.baseUrl + '/' + this.servicePath),
									data: JSON.stringify(invokeReq),
									timeout: 3000,
								},this.ajaxOpts);

			jQuery.ajax(ajaxObj);
		},

		doList: function() {},
		doHandshake: function(manifest, canvasId) {
			var baseImage = window.Mirador.Iiif.getImageId(manifest.getCanvasById(canvasId));
			
			var req = new $.Models.InvokeRequest({type: 'edit', images: [baseImage] });
			
			console.log('Invoker: Initiating Edit Handshake for ' + baseImage);
			this.sendRequest(req, function(json){
				jQuery.publish('Invoker.Handshake.Success', json);
				console.log('Invoker Handshake: success! response:' + JSON.stringify(json) );
			}, function(){
				jQuery.publish('Invoker.Handshake.Fail');
				console.log('Invoker Handshake ERROR!');
			});

		},
		doInvoke: function() {}
	};




})(window.InvokerLib,window.Mirador.ServiceManager);