window.Mirador = window.Mirador || {};
window.Mirador.FuncClass = window.Mirador.FuncClass || {};
window.Mirador.FuncClass.Utils = window.Mirador.FuncClass.Utils || {};

(function($) {

	/**
	 * Return JSON representation of Parameter
	 */
	$.Parameter = function(name,type,description) {
		return {
			name:name,
			type:type,
			description:description
		};
	};

	/**
	 * Parameter factory from XML string
	 * @param  {string} xmlString 
	 * @return {Parameter Object}
	 */
	$.Parameter.prototype.makeFromXML = function(xmlString) {
		var $el = jQuery(xmlString);
		var name = $el.attr('name');
		var type = $el.attr('type');
		var desc = $el.attr('description');

		return $.Parameter(name,type,desc);
	};

	/**
	 * Return JSON representation of Function Class
	 */
	$.Class = function(name,description,parameters) {
		return {
			name:name,
			description:description,
			parameters: parameters || []
		};
	};

	/**
	 * Function Class factory from XML string
	 * @param  {string} xmlString 
	 * @return {Class Object}
	 */
	$.Class.prototype.makeFromXML = function(xmlString) {
		var $el = jQuery(xmlString);
		var name = $el.attr('name');
		var desc = $el.attr('description');
		var $params = $el.find('parameter');
		var arr = [];

		$params.each(function(idx,$param) {
			 // this is a filthy trick to convert xml DOM element to string
			var xmlStr = jQuery('<div>').append($param).html();
			arr.push($.Parameter.prototype.makeFromXML(xmlStr) );
		});
		return $.Class(name,desc,arr);
	};

	/**
	 * Return JSON representation of Function
	 */
	$.Function = function(name,input,output,classes) {
		return {
			name:name,
			input:input,
			output:output,
			classes: classes || []
		};
	};

	/**
	 * Function factory from XML string
	 * @param  {string} xmlString 
	 * @return {Function Object}
	 */
	$.Function.prototype.makeFromXML = function(xmlString) {
		var $el = jQuery(xmlString);
		var name = $el.attr('name');
		var inp = $el.attr('input');
		var outp= $el.attr('output');
		var $classes = $el.find('class');
		var arr = [];

		$classes.each(function(idx,$class) {
			 // this is a filthy trick to convert xml DOM element to string
			var xmlStr = jQuery('<div>').append($class).html();
			arr.push($.Class.prototype.makeFromXML(xmlStr) );
		});
		return $.Function(name,inp,outp,arr);
	};


	$.FCManager = function() {
		this.funcs = [];
	};



})(Mirador.FuncClass);


