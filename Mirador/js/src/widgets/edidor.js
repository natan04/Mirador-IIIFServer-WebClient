//DONE: Editor Window setup
//TODO: Close button - implement functionality
//DONE: Resize
//DONE: Disable annotation icon
//DONE: Disable all other view options
//TODO: Try to play with navigations (don't need up/down/home)
//TODO: JQUERY UI Lib - fix with bower

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
		});

	      $.viewer.showLoaderOverlay('Sending edit request to server...');

	      $.ServiceManager.services.invoker.doHandshake(_this.parent.manifest, _this.canvasId);

      },


      setUpEditorWin: function() {
	      var _this = this;

	      // Set default dimensions
	      _this.element.height(_this.windowOptions.height);
	      _this.element.width(_this.windowOptions.width);

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
      	_this.window = new $.Window(windowConfig);

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
      },

      bindEvents: function() {
      	this.window.element.find('.edit-mode-close-btn').on('click', function() {
      		alert('Not implemented yet!');
      	});
      
      },

      closeEditor: function() {}
};


})(window.Mirador);