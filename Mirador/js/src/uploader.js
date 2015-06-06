window.Mirador = window.Mirador || {};
window.Mirador.Uploader = window.Mirador.Uploader || {};


// DONE: Handlebars Template
// TODO: Multifiles support
// DONE: Dynamic combo
// TODO: Option for refreshing
// TODO: Handle failure on combo fetching
// TODO: Handle of new manifest
// TODO: Change name of menu to "Admin" or something
// TODO: Change this to a global manifests editting admin panel (add,delete,append page etc.)
(function($) {
	
	/**
	 * UploaderForm class constructor
	 * @param {Object} options:  {  url  (String)  url for form submit (form action) 
	 *                           	show (Boolean) if true => form is visible
	 *                           	AppendTo (DOM element) Element to append the form to 
	 *                           	id (String) HTML Element id for form DIV
	 *                           	cls (String) like id}
	 */
	$.UploaderForm = function(options) {

		jQuery.extend(true, this,
		{
			url: 'localhost:4000/upload',
			show: false,
			id: "uploaderForm",
			cls: "uploaderForm",
			element: null,
			appendTo: null
		},options);

		this.element = jQuery(this.template(this));
		this.element.hide();
		this.showForm(this.show);
		this.element.appendTo(this.appendTo);

		this.dynCombo = new $.DynamicCombo({appendTo: this.element, autoExtend: true});
		this.dynCombo.fetchData();

		this.bindEvents();

	};

	// TODO: Upload form is messed up - add some borders, colors etc
	$.UploaderForm.prototype = {
		template: Handlebars.compile(
					["<div id={{id}} class={{cls}}>",
					"<form method='post' action={{url}} enctype='multipart/form-data'>",
					"<span>Please choose file: </span>",
					 "<input name='f' type='file'/>",
					 "<input name='id' class='idText' type='text' placeholder='Type name of a manuscript'/>",
					 "<input type='submit'/></form>",
					 "</div>"
					 ].join('')),

		bindEvents: function() {
			var _this = this;
			// Show form event
			jQuery.subscribe('uploadFormVisible.set',function(_, state)  {
				_this.showForm(state);
			});
			jQuery.subscribe('uploadForm.chooseId', function(_, obj){
				//console.log('choosed manuscript: '+obj);
				_this.element.find('.idText').val(obj);
			});
		},
		// FIX: form shows by default at startup!
		showForm: function(sh) {
			if(sh === undefined) 
				sh = !this.show;
			this.show = sh;
			var params = {effect: "slide", 
						  direction: "up", 
						  duration: 300, 
						  easing: "swing"
						};
			if (sh === true)
				this.element.show(params);
			else
				this.element.hide(params);
		}
	};



// ================== Dynamic Combobox ==========================
/**
 * Dynamic combobox for dynamically update from string arrays(JSON, Fetched)
 * @param { urlToFetch (string) url to webservice that returns JSON array of strings
 *          id (string) HTML id 
 *          cls (string) same as id
 *          autoExtend (Boolean) if true, extends combobox automatically as option list grows 
 *         }
 */
$.DynamicCombo = function(options) {
		jQuery.extend(true, this,
		{
			urlToFetch: 'http://localhost:3000/Manifests/id',
			id: "dynCombo",
			cls: "dynCombo",
			element: null,
			appendTo: null,
			data: [],
			autoExtend: false,
		},options);

		this.element = jQuery(this.template(this));
		this.element.appendTo(this.appendTo);
		this.element[0].size = 0;

		this.bindEvents();
};

$.DynamicCombo.prototype = {
	template: Handlebars.compile([
		"<select id='{{id}}' name='{{id}}' class='{{clsname}}'></select>"
		].join('')),

	bindEvents: function() {
		var _this = this;
		_this.element.change(function() {
			jQuery.publish('uploadForm.chooseId',_this.element.find('option:selected').text());
		});
	},

	addItem: function(text) {
		// Check if item exists
		var res = jQuery.grep(this.data,function(el,idx){
			return (el.text === text);
		});

		if (res.length > 0)
			return 0;

		// Not exists: Add to data array
		var $optEl = jQuery("<option>"+text+"</option>");
		this.data.push({text: text, element: $optEl});
		$optEl.appendTo(this.element);
		if(this.autoExtend)
			this.element[0].size++;
	},
	fetchData: function() {
		var _this = this;
		jQuery.getJSON(this.urlToFetch).done(function(data){
			console.log("DynCombo --> fetched data: " + data);

			jQuery.each(data, function(i, str){
				_this.addItem(str);
			});
		}).fail(function() { 
			console.log("DynCombo --> Failed to fetch data");
		});
	}
};


} )(Mirador.Uploader);