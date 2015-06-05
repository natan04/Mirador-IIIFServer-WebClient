window.Mirador = window.Mirador || {};
window.Mirador.Uploader = window.Mirador.Uploader || {};


// TODO: Handlebars Template
// TODO: Multifiles support
(function($) {
	
	/**
	 * UploaderForm class constructor
	 * @param {Object} options:  {  url  (String)  url for form submit (form action) 
	 *                           	show (Boolean) if true => form is visible
	 *                           	AppendTo (DOM element) Element to append the form to }
	 */
	$.UploaderForm = function(options) {
		this.url = options.url;

		this.show = options.show || false;

		this.element = jQuery(this.formHtml);
		this.element.attr('action',this.url);
		this.element.hide();
		this.showForm(this.show);
		this.element.appendTo(options.appendTo);

		this.bindEvents();

	};

	// TODO: Upload form is messed up - add some borders, colors etc
	$.UploaderForm.prototype = {
		formHtml: ["<form class='uploaderForm' method='post' enctype='multipart/form-data'>",
					"<input type='file'/>",
					"<input type='submit'/></form>"].join(''),

		bindEvents: function() {
			var _this = this;
			// Show form event
			jQuery.subscribe('uploadFormVisible.set',function(_, state)  {
				_this.showForm(state);
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


} )(Mirador.Uploader);