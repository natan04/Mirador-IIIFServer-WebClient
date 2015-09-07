//DONE: Editor Window setup
//DONE: Close button - implement functionality
//TODO: Close window - alert if history is full
//DONE: Resize
//DONE: Disable annotation icon
//DONE: Disable all other view options
//TODO: Try to play with navigations (don't need up/down/home)
//TODO: JQUERY UI Lib - fix with bower
//TODO: Refactor INVOKE
//BUG: Close button not working on first edit
//BUG: On invoke - the selected canvas resets to 0
//DONE: Preview-image marking
//TODO: Every invoke - increase canvas ID
//DONE: Current Flow Id in window header
//TODO: On BATCH finish - update current manifest and switch to new version
//TODO: Manifest versions ordering in Manifest Panel
(function($) {
/**
 * Wrapper class for editor Window
 */
        $.Edidor = function(options) {

         		jQuery.extend(this, {
                        parent: null,
                        appendTo: null,
                        element: null,
                        canvasId: null,
                        manifest: null,
                        window: null,
                        toolbox: null,
                        flowMenu: null,
                        currentFlowId: '-New Flow-',
                        windowOptions: {
                                height: 500,
                                width: 500,
                                draggable: true,
                                resizable: true
                        },
                        functionList: [],
                        flow: []
                }, options);



                this.init();


};



$.Edidor.prototype = {

	init: function() {
	
	var _this = this;

            console.log('Edidor: entering edit mode for canvasID ' + _this.currentCanvasID);

            // Handshake OK - Load window and manifest
            jQuery.subscribe('Invoker.Handshake.Success', function(ev, json) {
            	            
                	console.log('Edidor: successfully received edit mode manifest. entering new window');
                
                	_this.manifest = new $.Manifest();
                	_this.manifest.jsonLd = json;
                	_this.manifest.markCanvasesForPreview(json.previewImages);

                	$.viewer.hideLoaderOverlay();

                	_this.element = jQuery('<div>')
                    		.addClass('editor-win')
                    		.appendTo(_this.appendTo);


   		_this.setUpEditorWin();

		_this.bindEvents();


                	jQuery.unsubscribe('Invoker.Handshake.Success');
          	});

		// Handshake FAIL Callback
		jQuery.subscribe('Invoker.Handshake.Fail', function(ev, errStr) {
			
			// In case we already in editor
			if (_this.element) {
				return;
			}

			$.viewer.addLoaderOverlayMessage('<span style="color: red;">Request failed! reason: '+errStr+'</span>');

			setTimeout(function() { 
		  		  $.viewer.hideLoaderOverlay();
		    	}, 
		    	1000);

			_this.destroyEditor();
		});


	      $.viewer.showLoaderOverlay('Sending edit request to server...');

	      $.ServiceManager.services.invoker.doHandshake(_this.parent.manifest, _this.canvasId);

      },


      setUpInnerWin: function(refresh) {
      	var _this = this;


      	// Create editor window
	var windowConfig = {
		manifest: _this.manifest,
		currentCanvasID: _this.canvasId,
		currentFocus: 'ImageView',
		editMode: true,
		appendTo: _this.element,
		displayLayout:false,
		annotationLayerAvailable: false,
		annotationCreationAvailable: false
         	 };


      	if (refresh) {
      		windowConfig.appendTo= jQuery('<div>');
      	}


      	_this.window = new $.Window(windowConfig);
      	_this.window.element.prependTo(_this.element);

      	// Create close button
	jQuery('<a>')
		.addClass('mirador-btn')
		.addClass('edit-mode-close-btn')
		.attr('href','#')
		.css('float','left')
		.append(jQuery('<i class="fa fa-times fa-lg fa-fw"></i>'))
		.prependTo(_this.window.element.find('.manifest-info'));

	// Flow ID Title
	jQuery('<h3>')
		.addClass('editor-flow-title')
		.appendTo(_this.window.element.find('.manifest-info'))
		.text('Flow: ' + _this.currentFlowId);

	// Turn off window's irrelivant buttons
	_this.window.element.find('.edit-mode-option').hide();
	_this.parent.element.find('.edit-mode-option').hide();

	// Mark thumbnails as preview images
	jQuery.each(_this.manifest.getCanvases(), function(index, canvas) {
		if (canvas.previewImage) {
			_this.window.bottomPanel.element.find('.thumbnail-image').eq(index).addClass('preview-image');
		}
	} );

	// Set tooltip: invoke info for thumbnails
	_this.window.bottomPanel.element.find('.thumbnail-image').tooltip({
		content: function() {
			var id = jQuery(this).attr('data-image-id');
			var idx=Mirador.getImageIndexById(_this.window.imagesList, id) - 1;

			if (_this.flow.length === 0) {
				return '';
			}
			if (idx == -1) {
				return 'Base Image';
			}

			var str = jQuery(InvokerLib.Views.InvokeViewTemplate(_this.flow[idx])).html();

			return str;
		}
	});

	_this.bindWindowEvents();


      },

      setUpEditorWin: function() {
	var _this = this;

	// Set default dimensions
	_this.element.height(_this.windowOptions.height);
	_this.element.width(_this.windowOptions.width);

	_this.setUpInnerWin();

	if (_this.windowOptions.draggable) {
	// Turn on dragging and sets handle to upper manifest-info strip
	_this.element.draggable({
				handle: '.manifest-info', 
				cursor: 'move', 
				disabled: false,
	});
	}

	// Turn on resizing
	if(_this.windowOptions.resizable) {
		_this.element.resizable();
	}

	//Create dynamic functions toolbox (menu)
	_this.toolbox = new InvokerLib.Views.FuncsMenu({appendTo: _this.element});

	//Create dynamic flows menu
	_this.flowMenu = new InvokerLib.Views.FlowLoadMenu({appendTo: _this.element});      
      },

      bindEvents: function() {
      	var _this = this;


      	// User selected func/class/params and clicked invoke
	jQuery.subscribe('Invoker.FuncsMenu.select', function(ev, data) {
		_this.invoke(data.funcName, data.clsName, data.params);
	});

	// Invoke success - new manifest received
	jQuery.subscribe('Invoker.Invoke.Success', function(ev,data){
			console.log('Edidor - invoke request SUCCESS. Received manifest: ');
			console.log(JSON.stringify(data.json));
			
			_this.update(data.json);
	});

	// Invoke failed
	jQuery.subscribe('Invoker.Invoke.Fail', function(ev, data) {
			console.log('Edidor - invoke request FAILED.     '+data.err);
	});

	//Flow load
	jQuery.subscribe('Invoker.FlowsMenu.select', function(ev, data){
		jQuery.subscribe('Invoker.Handshake.Success', function(ev, json) {
			_this.currentFlowId = data.id;
			_this.update(json);
			jQuery.unsubscribe('Invoker.Handshake.Success');
		});

		$.ServiceManager.services.invoker.doHandshake(_this.parent.manifest, _this.canvasId, data.id);

	});

	//Flow Save click
	jQuery.subscribe('Invoker.FlowList.Save', function(ev, data) {
		_this.saveFlow(data.id);
	});

	//Flow Save success
	jQuery.subscribe('Invoker.SaveFlow.Success', function(ev, data){
		_this.currentFlowId = data.id;
		_this.update(data.json);
		_this.flowMenu.updateView();
		jQuery.unsubscribe('Invoker.FlowSave.Success');
	});



      
      },
      bindWindowEvents: function() {
      	// Close button
      	var _this = this;

      	_this.window.element.find('.edit-mode-close-btn').on('click', function() {
      		_this.destroyEditor();
      	});
      },
      update: function(manifestJson) {
      	var _this=this;

      	_this.manifest = new $.Manifest();
      	_this.manifest.jsonLd = manifestJson;
      	_this.flow = manifestJson.history;

      	_this.manifest.markCanvasesForPreview(manifestJson.previewImages);

      	_this.window.element.remove();
      	_this.window = null;

      	_this.setUpInnerWin(true);
      },

      invoke: function(funcName, clsName, params) {
      	var _this=this;

	var imageIndex = $.getImageIndexById(_this.window.imagesList, _this.window.currentCanvasID);
	var canvas = _this.window.manifest.getCanvasById(_this.window.currentCanvasID);
	var baseImage = window.Mirador.Iiif.getImageId(canvas);

	console.log('Edidor - sending invoke request for ' + _this.window.currentCanvasID + '      '+ baseImage + '       (' + imageIndex + ')');

	$.ServiceManager.services.invoker.doInvoke({
		funcName: funcName,
		className: clsName,
		params: params || [],
		index: imageIndex + 1,
		images: [baseImage]
	});

      },

      saveFlow: function(flowId) {
      	var _this = this;

	var imageIndex = $.getImageIndexById(_this.window.imagesList, _this.window.currentCanvasID);
	var canvas = _this.window.manifest.getCanvasById(_this.window.currentCanvasID);
	var baseImage = window.Mirador.Iiif.getImageId(canvas);


	console.log('Edidor - sending flow save request for '+ flowId);
	$.ServiceManager.services.invoker.doSaveFlow(flowId, imageIndex,baseImage, true); //TODO: Currently always overwrite


      },

      destroyEditor: function() {

      	this.window.element.remove();
      	this.window = null;

            if (this.element) {
		this.element.remove();
		this.toolbox = null;
		this.flowMenu = null;
	}

	jQuery.unsubscribe('Invoker.FuncsMenu.select');
	jQuery.unsubscribe('Invoker.FlowList.Save');
	jQuery.unsubscribe('Invoker.FlowsMenu.select');
	jQuery.unsubscribe('Invoker.Invoke.Success');
	jQuery.unsubscribe('Invoker.Invoke.Fail');

	this.parent.element.find('.edit-mode-option').show();


      	this.parent.editor = null;
      }
};


})(window.Mirador);