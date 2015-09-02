//DONE: Editor Window setup
//DONE: Close button - implement functionality
//TODO: Close window - alert if history is full
//DONE: Resize
//DONE: Disable annotation icon
//DONE: Disable all other view options
//TODO: Try to play with navigations (don't need up/down/home)
//TODO: JQUERY UI Lib - fix with bower
//TODO: Refactor INVOKE

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
                        windowOptions: {
                                height: 500,
                                width: 500,
                                draggable: true,
                                resizable: true
                        },
                        functionList: [],
                        history: []
                }, options);


                	this.element = jQuery('<div>')
                    .addClass('editor-win')
                    .appendTo(this.appendTo);

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

                	$.viewer.hideLoaderOverlay();

   			_this.setUpEditorWin();

   			_this.bindEvents();


                	jQuery.unsubscribe('Invoker.Handshake.Success');
          	});

		// Handshake FAIL Callback
		jQuery.subscribe('Invoker.Handshake.Fail', function(ev, errStr) {
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

	// Turn off window's EDIT button
	_this.window.element.find('.edit-mode-option').hide();
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
	      
      },

      bindEvents: function() {
      	var _this = this;

      	this.window.element.find('.edit-mode-close-btn').on('click', function() {
      		_this.destroyEditor();
      	});


//      	jQuery.publish('Invoker.FuncsMenu.select', {funcName: el.attr('data-func-name'), clsName: el.attr('data-class-name')});
	jQuery.subscribe('Invoker.FuncsMenu.select', function(ev, data) {
		var imageIndex = $.getImageIndexById(_this.window.imagesList, _this.window.currentCanvasID);
		var canvas = _this.window.manifest.getCanvasById(_this.window.currentCanvasID);
		var baseImage = window.Mirador.Iiif.getImageId(canvas);

		console.log('Edidor - sending invoke request for ' + _this.window.currentCanvasID + '      '+ baseImage + '       (' + imageIndex + ')');

		invoke = new InvokerLib.Models.Invoke(data.funcName, data.clsName, []);
		req = new InvokerLib.Models.InvokeRequest({index: imageIndex+1, images: [baseImage]});
		req.addInvoke(invoke);

		$.ServiceManager.services.invoker.sendRequest(req, function(json){
				console.log('Edidor - invoke request SUCCESS. Received manifest: ');
				console.log(JSON.stringify(json));
				
				_this.manifest = new $.Manifest();
				_this.manifest.jsonLd = json;

				_this.window.element.remove();
				_this.window = null;


				_this.setUpInnerWin(true);


		}, function(jq,str,exp) {
				console.log('Edidor - invoke request FAILED.     '+str);
		});
	});

      
      },

      destroyEditor: function() {
      	      this.window = null;

      	      if (this.element) {
      			this.toolbox.element.remove();
      			this.element.remove();
      			this.toolbox = null;
      		}
      		this.parent.editor = null;
      }
};


})(window.Mirador);