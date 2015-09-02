window.InvokerLib = window.InvokerLib || {};
window.InvokerLib.Models = window.InvokerLib.Models || {};

// DONE: Added Invoker models classes (Function,Parameter,Class, InvokeRequest, Invoke)
// DONE: Added simple dummy requests functions



/*
	FUNCTIONS LIST:
		Available at /Invoker service HTTP GET request

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
				index - index of current selected image (from thumbnails array)
				images - image array
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

	/*
		
	 */

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
			index: 0
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
			ajaxOpts: {type: "POST", dataType: "json", xhrFields: {withCredentials: true} },
			timeout: 10000
		},options);

	};

	$.InvokerService.prototype = {

		sendRequest: function(invokeReq,successCallback, failCallback,url, methodType, customAjax){
			var dataToSend = null;

			if (invokeReq) {
				dataToSend = JSON.stringify(invokeReq);
			}

			var ajaxObj = jQuery.extend(true, {
									success: successCallback,
									error: failCallback,
									url: url || (this.baseUrl + '/' + this.servicePath),
									data: dataToSend,
									timeout: this.timeout,
								},this.ajaxOpts, customAjax || {});

			if (methodType) {
				ajaxObj.type = methodType;
			}

			jQuery.ajax(ajaxObj);
		},

		doList: function() {
			console.log('Invoker: Fetching functions list');

			this.sendRequest('', function(json){
				console.log('Invoker: Functions list receive SUCCESS, response: ');
				console.log(JSON.stringify(json));
				
				jQuery.publish('Invoker.List.Success', {funcList: json});

			}, function(jq, err, exp){
				console.log('Invoker: Functions list receive FAILED. err: ' + err);
				jQuery.publish('Invoker.List.Fail', err);
			}, '', 'GET', {xhrFields: {withCredentials: false } } );

		},
		doHandshake: function(manifest, canvasId) {
			var baseImage = window.Mirador.Iiif.getImageId(manifest.getCanvasById(canvasId));
			
			var req = new $.Models.InvokeRequest({type: 'edit', images: [baseImage] });
			
			console.log('Invoker: Initiating Edit Handshake for ' + baseImage);
			this.sendRequest(req, function(json){
				jQuery.publish('Invoker.Handshake.Success', json);
				console.log('Invoker Handshake: success! response:' + JSON.stringify(json) );
			}, function(jqXHR, err, exp){
				jQuery.publish('Invoker.Handshake.Fail', err);
				console.log('Invoker Handshake ERROR! (' + err +')');
			});

		},
		doInvoke: function() {}
	};




})(window.InvokerLib,window.Mirador.ServiceManager);