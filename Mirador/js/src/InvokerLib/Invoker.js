/**
 * @namespace
 */
window.InvokerLib = window.InvokerLib || {};

/**
 * @namespace
 */
window.InvokerLib.Models = window.InvokerLib.Models || {};

/*
	FUNCTIONS LIST:
		Request: InvokeRequest(GET) with parameter(url-encoded) "command=funcs"
			Example: http://localhost:8000/PictureHandler/Invoker?cmd=funcs
		Response: [Array of func-objects]

	ENTER INTO EDIT MODE (HANDSHAKE):
		1.User selects canvas(image) & clicks "EDIT"
		2.Mirador sends "Edit Handshake" to Invoker:
					{
						type: 'edit',
						images: [<image_canvas_id> - for example: "aaa/default/blabla.jpg"]
					}

		3.Invoker sends special "edit mode" manifest for specific images
	
		4.Mirador presents "edit mode" manifest on new imageView window

	INVOKE: FOR EVERY FUNCTION INVOKE(INSIDE EDITOR IMAGEVIEW):
		1.User selects function/class/parameters
		2.Mirador sends regular invokeRequest to invoker:
				index - index of current selected image (from thumbnails array)
				images - image array
				invoke - invoke object
		3.Invoker sends back new "edit mode" manifest	
		4.Manifest includes special field "previewImages" - array of images indices
			Preview Images - "children" of a currently edited image, giving the ability to choose
				between different versions for the same image with different invoke
				MARKED AS RED.


	SAVING CURRENT FLOW
		1.User selects an image which he wants it to be the last image on the flow
			(the image that best represents the user's final results )
		1.User selects "save" option, fills name/id/label
		2.Mirador sends invokeRequest to invoker:
				type = "save"
				id = <string id filled by user>
				index = <index of last image> 
				overwrite = <True/False>
				(Invoker must know the current editing session's history)
		3.Invoker responds with new manifest, like normal invoke (without preview images)
		   OR ERROR response

		---Summary---
		Select last image -> "Save" button -> input id -> 
		-> send invokeRequest: {"type":"save", "id":"<id>", "overwrite": true/false, "index":"<idx>"}
		-> New manifest received & displayed

	LOADING FLOW
		1.User selects canvas/image
		1.User selects specific flow from a list(from server) and clicks "LOAD"
		2.Mirador sends HANDSHAKE InvokeRequest BUT with additional field "id"
							("id" helps differentiate between pure handshake and
							load requests.)
		3.Invoker produces the same sequence, creates a manifest from it and sends back to mirador
		4.Mirador presents manifest with let the user continue editing

		---Summary---
		Select image & flow -> Send HANDSHAKE req with field "id" 
		-> Invoker produces the same image sequence -> edit mode manifest displayed


	FLOW LIST
		Request: InvokeRequest(GET) with parameter(url-encoded) "command=flows"
				Example: http://localhost:8000/PictureHandler/Invoker?cmd=flows

		Response: Array of json flow objects:   { "id":"<id>", 
							  "invokes":[<invoke1>,<invoke2>.....] 
							 }


	BATCH SERVICE WEB-SOCKET API

		Request/Response format: JSON - normal InvokeRequest

		Types: ("type" field):
			"batch" -> Start batch request.
				 		        field: "images": [<images>]
							     "flowId": "<Flow Id>"
							     "book": "<bookId>",
							     "newVersion":"<versionId>"	

			"progress" -> on every function exit:  fields:    "display":"<message to display>"
									"currentImageIndex":"<current processed image index>"

			"error" -> 			 	fields: "display": "<error message>"

			"complete" -> field: empty.....
			}




 */




/* ------------------------------------------------------ */
/*  			Models									  */
/* ------------------------------------------------------ */

(function($,ServiceManager) {

	/**
	 * Represents a parameter object 
	 * @constructor
	 * @param {string} name - parameter name
	 * @param {string} type - parameter type (int/float/bool)
	 * @param {string} description - parameter description
	 */
	$.Parameter = function(name, type, description) {
		return {
			name: name,
			type: type,
			description: description
		};
	};

	/**
	 * Represents specific function class
	 * @constructor
	 * @param {string} name - function-class name
	 * @param {string} description - function-class description
	 * @param {Parameter[]} parameters  - array of Parameter that this class offers
	 */
	$.Class = function(name, description, parameters) {
		return {
			name: name,
			description: description,
			parameters: parameters || []
		};
	};

	/**
	 * Represents collection of function-classes
	 * @constructor
	 * @param {string} name - function name
	 * @param {string} input - input
	 * @param {string} output  - output
	 * @param {Class[]} classes - array of Classes under the same function
	 */
	$.Function = function(name, input, output, classes) {
		return {
			name: name,
			input: input,
			output: output,
			classes: classes || []
		};
	};


	/**
	 * Represents single invoke command
	 * @constructor
	 * @param {string} func_name  - function name
	 * @param {string} class_name - function-class name
	 * @param {Parameter[]} parameters - Array of parameters (with value field)
	 */
	$.Invoke = function(func_name, class_name, parameters){
		return {
			function: func_name,
			class: class_name,
			parameters: parameters || []
		};
	};

	/**
	 * Represents Invoke JSON Request
	 * @constructor
	 * @param {Object} options - invoke request parameters
	 * @param {string} options.type - Request Type (preview / edit / save)
	 * @param {string} options.id - Invoke Identifier (label)
	 * @param {Invoke} options.invoke - Invoke instance
	 * @param {string[]} options.images - Array of IIIF URIs for images to process
	 * @param {int} options.index -  Image index
	 */
	$.InvokeRequest = function(options) {
		jQuery.extend(true, this, {
			type: 'preview',
			id: '',
			invoke: null,
			images: [],
			index: 0
		},options);

	};

	// API changed to single Invoke per request
	$.InvokeRequest.prototype = {
		addInvoke: function(invoke) {
			this.invoke = invoke;
		}


	};



})(window.InvokerLib.Models);



(function($,ServiceManager) {

	$.flowList = [];

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
			timeout: 10000,
			wsObject: null,	// WebSocket for BATCH
			batcherUrl: ''
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

			url = (this.baseUrl + '/' + this.servicePath + '?cmd=funcs');

			this.sendRequest('', function(json){
				console.log('Invoker: Functions list receive SUCCESS, response: ');
				console.log(JSON.stringify(json));
				
				jQuery.publish('Invoker.List.Success', {funcList: json});

			}, function(jq, err, exp){
				console.log('Invoker: Functions list receive FAILED. err: ' + err);
				jQuery.publish('Invoker.List.Fail', err);
			}, url, 'GET', {xhrFields: {withCredentials: false } } );

		},
		doHandshake: function(manifest, canvasId, flowId) {
			var baseImage = window.Mirador.Iiif.getImageId(manifest.getCanvasById(canvasId));
			
			var req = new $.Models.InvokeRequest({type: 'edit', images: [baseImage], id: (flowId || '') });
			
			console.log('Invoker: Initiating Edit Handshake for ' + baseImage);
			this.sendRequest(req, function(json){
				jQuery.publish('Invoker.Handshake.Success', json);
				console.log('Invoker Handshake: success! response:' + JSON.stringify(json) );
			}, function(jqXHR, err, exp){
				jQuery.publish('Invoker.Handshake.Fail', err);
				console.log('Invoker Handshake ERROR! (' + err +')');
			});

		},
		doInvoke: function(options) {
			invoke = new InvokerLib.Models.Invoke(options.funcName, options.className, options.params);
			req = new InvokerLib.Models.InvokeRequest({index: options.index, images: options.images});
			req.addInvoke(invoke);

			this.sendRequest(req, function(json) {
				jQuery.publish('Invoker.Invoke.Success', {json: json});
			}, function(jq, err, exp) {
				jQuery.publish('Invoker.Invoke.Fail', {err: err});
			});


		},

		doFlowList: function(){
			console.log('Invoker: Fetching functions list');

			url = (this.baseUrl + '/' + this.servicePath + '?cmd=flows');

			this.sendRequest('', function(json){
				console.log('Invoker: Flows list receive SUCCESS, response: ');
				console.log(JSON.stringify(json));

				jQuery.publish('Invoker.FlowList.Success', {flows: json});

			}, function(jq, err, exp){
				console.log('Invoker: Flows list receive FAILED. err: ' + err);
				jQuery.publish('Invoker.FlowList.Fail', err);
			}, url, 'GET', {xhrFields: {withCredentials: false } } );

		},
		doLoadFlow: function(id) {},
		doSaveFlow: function(id, index, imageId, overwrite) {
			req = new InvokerLib.Models.InvokeRequest({type: 'save', index: index, id: id, images: [imageId], overwrite:overwrite });

			this.sendRequest(req, function(json) {
				console.log('Invoker - Save flow SUCCESS, response: ');
				console.log(JSON.stringify(json));

				// Check for response error
				if (json.constructor == Array && json[0] == "0") {
					console.log('Invoker - Save flow  response ERROR: '+json[0] + ': ' +json[1]);
					return;
				}

				jQuery.publish('Invoker.SaveFlow.Success', {json: json, id: id});
			}, function(jq, err, exp) {
				console.log('Invoker - Save flow FAILED. err: '+ err);
				jQuery.publish('Invoker.SaveFlow.Fail', {err: err});
			});
		},
		doBatch: function(flowId, verName, images, bookId) {
			var _this = this;
			var batchReq = {	type: "batch",	
						images: images,
						flowId: flowId,
						book: bookId,
						newVersion: verName};

			console.log('Batcher - Opening websocket for '+this.batcherUrl);

			this.wsObject = new WebSocket(this.batcherUrl);

			this.wsObject.onopen = function(event) {
				console.log('Batcher - connction opened. sending batch request');
				_this.wsObject.send(JSON.stringify(batchReq));

				window.Mirador.viewer.showLoaderOverlay('Initiating BATCH request.');
				jQuery('#loader-overlay-progbar').progressbar();
			};

			this.wsObject.onmessage = function(event) {
				var obj = JSON.parse(event.data);
				var idx = obj.currentImageIndex;

				var perc = (idx/images.length)*100;

				console.log('Batcher - message arrived: ');
				console.log(event.data);
				console.log(obj);
				console.log(perc);

				if (idx === -1) {
					window.Mirador.viewer.addLoaderOverlayMessage('<span style="color: red;">'+obj.display+'</span>');
				} else {
					window.Mirador.viewer.addLoaderOverlayMessage(obj.display);
					jQuery('#loader-overlay-progbar').progressbar({value: perc });
				}
			};

			this.wsObject.onclose = function(event) {
				var closeCode = event.code;

				console.log('Batcher - CLOSED. code: ' + closeCode);
				window.Mirador.viewer.addLoaderOverlayMessage('BATCH Closed: ' + closeCode);

				jQuery.subscribe('Batcher.Closed');

				setTimeout(function() { 
		  		  	window.Mirador.viewer.hideLoaderOverlay();
		    		}, 
		    		1500);

			};



		}

	};




})(window.InvokerLib,window.Mirador.ServiceManager);