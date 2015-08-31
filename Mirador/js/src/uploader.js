window.Mirador = window.Mirador || {};
window.Mirador.Uploader = window.Mirador.Uploader || {};


// DONE: Handlebars Template
// DONE: Fixed bug: form shows by default at startup!
// DONE: option for base URL for manifestService
// DONE: Upload function
// DONE: Dynamic combo
// DONE: Option for refreshing
// DONE: Close button
// DONE: Fixed Bug with form field id (Expects ID uppercase)
// DONE: Support for global Service Manager class

// TODO: Upload API response handling - array [ErrCode, Desc] (success = 0)
// TODO: Checkbox for file overwrite (name: overwriteFlag)
// TODO: Multifiles support
// TODO: Handle failure on combo fetching
// TODO: Handle of new manifest
// TODO: Change name of menu to "Admin" or something
// TODO: Change this to a global manifests editting admin panel (add,delete,append page etc.)
(function($,mInst) {
	
	/**
	 * UploaderForm class constructor
	 * @param {Object} options:  {  baseUrl  (String)  base url for manifest service 
	 *                           	show (Boolean) if true => form is visible
	 *                           	AppendTo (DOM element) Element to append the form to 
	 *                           	id (String) HTML Element id for form DIV
	 *                           	cls (String) like id}
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

	// TODO: Upload form is messed up - add some borders, colors etc
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

		// Binds global events:
		// uploadFormVisible.set - called when user clicks on menu item
		// uploadForm.chooseId - when choosing manifest id from combobox
		// uploadForm.msg - for messaging/error reporting
		// refBtn a onClick - refresh button click
		// input file change - whenever user chooses file
		// submit - form submit
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

	bindEvents: function() {
		var _this = this;
		_this.element.change(function() {
			jQuery.publish('uploadForm.chooseId',_this.element.find('option:selected').text());
		});

		jQuery.subscribe('dynCombo.refresh',function(_,obj){
			_this.fetchData();
		});
	},


	clearAll: function() {
		this.element.html('');
		this.data = [];
		this.element[0].size = 0;
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

		jQuery.publish('dynCombo.dataAdded',text);

	},
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