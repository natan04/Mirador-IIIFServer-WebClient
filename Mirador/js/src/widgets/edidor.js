//DONE: Editor Window setup
//TODO: Close button
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
                        }
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

	      _this.element.height(_this.windowOptions.height);
	      _this.element.width(_this.windowOptions.width);


  	    	var windowConfig = {
    		    manifest: _this.manifest,
                currentCanvasID: _this.canvasId,
                currentFocus: 'ImageView',
                editMode: true,
                appendTo: _this.element,
                layoutOptions : {
        			"newObject" : false,
        			"close" : true,
        			"slotRight" : false,
        			"slotLeft" : false,
        			"slotAbove" : false,
        			"slotBelow" : false
      		},
      		annotationLayerAvailable: false,
      		annotationCreationAvailable: false

         	 };
          
      	_this.window = new $.Window(windowConfig);

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




      }
};


})(window.Mirador);