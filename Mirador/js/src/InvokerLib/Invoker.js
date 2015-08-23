window.InvokerLib = window.InvokerLib || {};
window.InvokerLib.Models = window.InvokerLib.Models || {};

// DONE: Added Invoker models classes (Function,Parameter,Class, InvokeRequest, Invoke)
// DONE: Added simple dummy requests functions


/* ------------------------------------------------------ */
/*  			Models									  */
/* ------------------------------------------------------ */

(function($) {


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

	$.InvokeRequest = function(req_type, invokes, images_ids) {
		this.type = req_type || "preview";
		this.invokes = invokes || {};
		this.images = images_ids || [];
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



(function($) {



	$.createDummy = function() {
		res = {
			type: "preview",
			invokes: {},
			images: []
		};

		res.invokes["0"] = {
			Function: "Binarizer",
			Class: "Threshold",
			Parameters: []
		};
		res.invokes["0"].Parameters.push({
			name: "level",
			value: "20"
		});
		res.invokes["0"].Parameters.push({
			name: "reverse",
			value: "true"
		});

		res.images.push('achbar/default/11655127_10153432370269337_1461771407_n.jpg');

		return res;

	};

	$.sendDummy = function(url, sendWhat) {
		if (!url) {
			url = 'http://132.72.46.235:8080/PictureHandler/Invoker';
		}

		if (!sendWhat) {
			sendWhat = JSON.stringify($.createDummy());
		}

		console.log('Invoker: dummy request initiated - url: ' + url);
		jQuery.ajax({
			type: "POST",
			url: url,
			data: sendWhat,
			dataType: "text",

			success: function(data, status) {
				console.log('Invoker: dummy request success - status ' + status + ', data:');
				console.log(data);
			},

			error: function(jqXHR, status, error) {
				console.log('Invoker: dummy request FAILED - status ' + status + ', error ' + error);
			}
		});

	};



})(window.InvokerLib);