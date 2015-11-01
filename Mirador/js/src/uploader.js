window.Mirador = window.Mirador || {};

/**
 * Uploader form and Dynamic combobox
 * @namespace
 */
window.Mirador.Uploader = window.Mirador.Uploader || {};


(function($,mInst) {
	
	/**
	 * UploaderForm class constructor
	 * @constructor
	 * @param {Object} options - config for UploaderForm
	 * @param {string} options.baseUrl - base url for manifest service (PictureHandler) - depreciated
	 * @param {boolean} options.show - if true => form is visible
	 * @param {DOMElement} options.AppendTo - Element to append the form to
	 * @param {string} options.id - HTML Element id for form DIV element
	 * @param {string} options.cls - same as id but for CSS Class
	 */
	$.UploaderForm = function(options) {

		jQuery.extend(true, this,
		{
			show: false,
			id: "uploaderForm",
			cls: "uploaderForm",
			element: null,
			appendTo: null,
			filesToUp: [],
			parent: null
		},options);

		this.url = mInst.ServiceManager.getUrlForCommand('PictureHandler','upload');
		this.element = jQuery(this.template(this));
		this.element.hide();
		this.showForm(this.show);
		this.element.appendTo(this.appendTo);

		this.dynCombo = new $.DynamicCombo({appendTo: this.element, 
											autoExtend: true,
											urlToFetch: mInst.ServiceManager.getUrlForCommand('PictureHandler','list')});
		this.dynCombo.fetchData();

		this.bindEvents();

	};

	$.UploaderForm.prototype = {
		template: Handlebars.compile(
					["<div id={{id}} class={{cls}}>",
					"<form method='post' action={{url}} enctype='multipart/form-data'>",
					"<span>Please choose file: </span>",
					 "<input name='file' type='file'/>",
					 "<input name='ID' class='idText' type='text' placeholder='Type name of a manuscript'/>",
					 "<input type='submit'/></form>",
					 "<div class='reports'></div>",
					 "<div class='refBtn'><a href='javascript:'>Refresh</a></div>",
					 "<div class='closeBtn'><a href='javascript:'>Close</a></div>",
					 "</div>"
					 ].join('')),

		/**
		* Binds global events: <br>
		* uploadFormVisible.set - called when user clicks on menu item<br>
		* uploadForm.chooseId - when choosing manifest id from combobox<br>
		* uploadForm.msg - for messaging/error reporting<br>
		* refBtn a onClick - refresh button click<br>
		* input file change(DOM Event) - whenever user chooses file<br>
		* submit(DOM Event) - form submit
		*/
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
			jQuery.subscribe('uploadForm.msg',function(_, msg) {
				_this.element.find('.reports').text(msg);
			});
			_this.element.find('.refBtn a').on('click',function(){
				jQuery.publish('dynCombo.refresh',{});
			});
			this.element.find('.closeBtn a').on('click', function() {
				_this.parent.toggleUploadForm();
			});
			_this.element.find('input[type=file]').on('change', function(ev){
				_this.filesToUp = ev.target.files;
			});
			_this.element.on('submit',_this,_this.sendFile);
		},
		/**
		 * Change form visible (according to given parameter)
		 * @param  {boolean} sh - True -> show form, False -> hide form
		 */
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
		},
		/**
		 * Sends the chosen file to PictureHandler's Uploader service
		 * @param  {Object} event - DOM Event related to the sending (used by form submit)
		 */
		sendFile: function(event) {
			event.stopPropagation();
			event.preventDefault();
			jQuery.publish('uploadForm.msg','Uploading...');
			var fData = new FormData(event.data.element.find('form')[0]);
			var f = event.data.filesToUp[0];

			var ajxObj = {
				url: event.data.url,
				type: 'post',
				data: fData,
				cache: false,
				processData: false,
				contentType: false,
				crossDomain: true,
				dataType: 'json',
				enctype:'multipart/form-data',
				xhrFields: {
				      withCredentials: true
				},
				success: function(data,stat) {
					console.log('ajax upload done: '+data);
					if (data[0] === '0') {
						jQuery.publish('uploadForm.msg','Upload done. code '+data[0]+': '+data[1]);
						jQuery.publish('dynCombo.refresh');
					} else {
						jQuery.publish('uploadForm.msg','Upload remote error code '+data[0] +': '+data[1]);
					}
				},
				error: function(jq,stat,err) {
					console.log('ajax upload ERROR: '+stat+', '+err);
					jQuery.publish('uploadForm.msg','Upload local error: ' + err);
				}
			};
			jQuery.ajax(ajxObj);

		}
	};

/**
 * Constructs DynamicCombo (fetches entries from specific url - used for Manifests List)
 * @constructor
 * @param {Object} options - Config for DynCombo
 * @param {string} options.urlToFetch - URL for list items fetching (expects JSON Array of strings)
 * @param {string} options.id - ID for DynCombo's HTML Element
 * @param {string} options.cls - Same as id but for CSS class
 * @param {DOMElement} options.appendTo - DOM Element to append DynCombo to
 * @param {boolean} options.autoExtend - if true - DynCombo size changes according to items count
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
			autoExtend: false
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

	/**
	 * Binds global events: <br>
	 * dynCombo.refresh - whenever items need to be refetched from server
	 */
	bindEvents: function() {
		var _this = this;
		_this.element.change(function() {
			jQuery.publish('uploadForm.chooseId',_this.element.find('option:selected').text());
		});

		jQuery.subscribe('dynCombo.refresh',function(_,obj){
			_this.fetchData();
		});
	},

	/**
	 * Clears all items
	 */
	clearAll: function() {
		this.element.html('');
		this.data = [];
		this.element[0].size = 0;
	},

	/**
	 * Adds an item (checks first if already exists)
	 * @param {string} text - text to add to DynCombo
	 */
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

		jQuery.publish('dynCombo.dataAdded',text);

	},
	/**
	 * Fetches items from server and updates DynCombo
	 */
	fetchData: function() {
		var _this = this;

		var ajaxObj = {
			dataType: 'json',
			url: this.urlToFetch,
			xhrFields: {
			      withCredentials: true
			   }
		};

		jQuery.ajax(ajaxObj).done(function(data){
			console.log("DynCombo --> fetched data: " + data);

			_this.clearAll();
			jQuery.each(data, function(i, str){
				_this.addItem(str);
			});
		}).fail(function() { 
			console.log("DynCombo --> Failed to fetch data");
		});
	}
};


} )(Mirador.Uploader,Mirador);