(function($) {

  // Takes a list of oa:annotations passed
  // by reference and renders their regions,
  // registering updates.

  $.OsdCanvasRenderer = function(options) {

    jQuery.extend(this, {
      osd:       null,
      osdViewer: null,
      elements:  null,
      list:      null,
      parent:    null,
      annoTooltips: {},
      tooltips:  null,
      overlays:  []
    }, options);
  };

  $.OsdCanvasRenderer.prototype = {
    parseRegion: function(url) {
      var regionString;
      if (typeof url === 'object') {
        regionString = url.selector.value;  
      } else {
        regionString = url.split('#')[1];
      }
      var regionArray = regionString.split('=')[1].split(',');
      return regionArray;
    },

    getOsdFrame: function(region) {
      var rectX = region[0],
      rectY = region[1],
      rectW = region[2],
      rectH = region[3];

      return this.osdViewer.viewport.imageToViewportRectangle(rectX,rectY,rectW,rectH);

    }, 

    render: function() {
      var _this = this;
      _this.hideAll();
      this.overlays = [];
      this.list.forEach(function(annotation) {
        var region = _this.parseRegion(annotation.on),
        osdOverlay = document.createElement('div');
        osdOverlay.className = 'annotation';
        osdOverlay.id = annotation['@id'];
        _this.osdViewer.addOverlay({
          element: osdOverlay,
          location: _this.getOsdFrame(region)
        });
        _this.overlays.push(jQuery(osdOverlay));
      });
      
      this.tooltips = jQuery(this.overlays).qtip({
            overwrite : false,
            content: {
             text : ''
             },
             position : {
              target : 'mouse',
              adjust : {
                mouse: false
              },
              container: jQuery(_this.osdViewer.element)
             },
             style : {
              classes : 'qtip-bootstrap'
             },
             show: {
              delay: 20
             },
             hide: {
                fixed: true,
                delay: 50,
                event: 'mouseleave'
             },
             events: {
               show: function(event, api) {
                 var overlays = _this.getOverlaysFromElement(jQuery(event.originalEvent.currentTarget)),
                 annoTooltip = new $.AnnotationTooltip(), //pass permissions
                 annotations = [];
                 
                 jQuery.each(overlays, function(index, overlay) {
                   annotations.push(_this.getAnnoFromRegion(overlay.id)[0]);
                 });
                 api.set({'content.text' : annoTooltip.getViewer(annotations)});
                 },
               visible: function(event, api) {
                 _this.removeAnnotationEvents(event, api);
                 _this.annotationEvents(event, api);
               },
               move: function(event, api) {
                 _this.removeAnnotationEvents(event, api);
                 _this.annotationEvents(event, api);
                 _this.annotationSaveEvent(event, api);
               },
               hidden: function(event, api) {
                 if (jQuery('.qtip:visible').length === 0) {
                  jQuery(_this.osdViewer.canvas).find('.annotation').removeClass('hovered');
                 }
               }
             }
      });

      this.bindEvents();
    },

    getAnnoFromRegion: function(regionId) {
      return this.list.filter(function(annotation) {
        return annotation['@id'] === regionId;
      });
    },
    
    getOverlaysFromElement: function(element) {
      var _this = this,
      eo = element.offset(),
      el = eo.left,
      et = eo.top,
      er = el + element.outerWidth(),
      eb = et + element.outerHeight();
              
      var overlays = jQuery(_this.osdViewer.canvas).find('.annotation').map(function() {
        var self = jQuery(this),
        offset = self.offset(),
        l = offset.left,
        t = offset.top,
        r = l + self.outerWidth(),
        b = t + self.outerHeight();
        
        //check if the current overlay has a corner contained within the element that triggered the mouseenter
        //OR check if element has a corner contained within the overlay
        //so that any overlapping annotations are stacked and displayed
        //this will also find when the overlay and element are the same thing and return it, which is good, we don't have to add it separately
        return (((l >= el && t >= et && l <= er && t <= eb) || 
                (l >= el && b <= eb && l <= er && b >= et) || 
                (r <= er && t >= et && r >= el && t <= eb) || 
                (r <= er && b <= eb && r >= el && b >= et)) ||
                
                ((el >= l && et >= t && el <= r && et <= b) || 
                (el >= l && eb <= b && el <= r && eb >= t) || 
                (er <= r && et >= t && er >= l && et <= b) || 
                (er <= r && eb <= b && er >= l && eb >= t)
                )) ? this : null;
      });
      jQuery(_this.osdViewer.canvas).find('.annotation.hovered').removeClass('hovered');
      overlays.addClass('hovered');
      return overlays;
    },

    bindEvents: function() {
      var _this = this;
            
     this.osdViewer.addHandler('zoom', $.debounce(function(){
          _this.checkMousePosition();
        }, 200, true));
      
      jQuery.subscribe('removeTooltips.' + _this.parent.windowId, function() {
        jQuery(_this.osdViewer.canvas).find('.annotation').qtip('destroy', true);
      });

    },
    
    checkMousePosition: function() {
      jQuery('.qtip').qtip('hide');
    },

    update: function() {
      this.render();
    },

    hideAll: function() {
      this.osdViewer.clearOverlays();
    },

    getElements: function() {
      this.elements = this.osdViewer.currentOverlays.reduce(function(result, currentOverlay) {
        currentOverlay = jQuery(currentOverlay);
        return result.add(currentOverlay);
      });
      return elements;
    },
    
    //change content of this tooltip, and disable hiding it, until user clicks save or cancel
    //disable all other qtips until editing this is done
    freezeQtip: function(api, oaAnno, annoTooltip) {
      jQuery.each(this.overlays, function(index, value) {
          var overlayApi = value.qtip('api');
          if (api.id !== overlayApi.id) {
            overlayApi.disable(true);
          }
        });
        api.set({'content.text' : annoTooltip.getEditor(oaAnno),
        'hide.event' : false});
    },
    
    //reenable all other qtips
    //update content of this qtip to make it a viewer, not editor
    //and reset hide event       
    unFreezeQtip: function(api, oaAnno, annoTooltip) {
      jQuery.each(this.overlays, function(index, value) {
           var overlayApi = value.qtip('api');
           if (api.id !== overlayApi.id) {
            overlayApi.disable(false);
           }
          });
      api.set({'content.text' : annoTooltip.getViewer([oaAnno]),
          'hide.event' : 'mouseleave'}).hide();
    },
    
    removeAnnotationEvents: function(tooltipevent, api) {
      jQuery('.annotation-tooltip a.delete').off("click");
      jQuery('.annotation-tooltip a.edit').off("click");
      jQuery('.annotation-tooltip a.save').off("click");
      jQuery('.annotation-tooltip a.cancel').off("click");
    },

    annotationEvents: function(tooltipevent, api) {
      var _this = this,
      annoTooltip = new $.AnnotationTooltip();
      jQuery('.annotation-tooltip a.delete').on("click", function(event) {
        event.preventDefault();
        
        if (!window.confirm("Do you want to delete this annotation?")) { 
          return false;
        }

        var display = jQuery(this).parents('.annotation-display'),
        id = display.attr('data-anno-id'),
        oaAnno = _this.getAnnoFromRegion(id)[0];
        jQuery.publish('annotationDeleted.'+_this.parent.windowId, [oaAnno]);

        //remove this annotation's overlay from osd
        //should there be some sort of check that it was successfully deleted? or pass when publishing?
        _this.osdViewer.removeOverlay(jQuery(_this.osdViewer.element).find(".annotation#"+id)[0]);
        
        //hide tooltip so event handlers don't get messed up
        api.hide();
        display.remove(); //remove this annotation display from dom
      });

      jQuery('.annotation-tooltip a.edit').on("click", function(event) {
        event.preventDefault();
        
        var display = jQuery(this).parents('.annotation-display'),
        id = display.attr('data-anno-id'),
        oaAnno = _this.getAnnoFromRegion(id)[0];
       
        _this.freezeQtip(api, oaAnno, annoTooltip);
      });
    },
    
    annotationSaveEvent: function(event, api) {
      var _this = this,
      annoTooltip = new $.AnnotationTooltip();
      
      jQuery('.annotation-tooltip').on("submit", function(event) {
        event.preventDefault();
        jQuery('.annotation-tooltip a.save').click();
      });

      jQuery('.annotation-tooltip a.save').on("click", function(event) {
        event.preventDefault();
                  
        var display = jQuery(this).parents('.annotation-tooltip'),
        id = display.attr('data-anno-id'),
        oaAnno = _this.getAnnoFromRegion(id)[0];
                  
        //check if new resourceText is empty??
        var tagText = jQuery(this).parents('.new-annotation-form').find('.tags-editor').val(),
        resourceText = jQuery(this).parents('.new-annotation-form').find('.text-editor').val(),
        tags = [];
        tagText = $.trimString(tagText);
        if (tagText) {
            tags = tagText.split(/\s+/);
        }

        var bounds = _this.osdViewer.viewport.getBounds(true);
        var scope = _this.osdViewer.viewport.viewportToImageRectangle(bounds);
        //bounds is giving negative values?
        //update scope?
                  
        var motivation = [],
        resource = [],
        on;
                  
        //remove all tag-related content in annotation
        oaAnno.motivation = jQuery.grep(oaAnno.motivation, function(value) {
            return value !== "oa:tagging";
        });
        oaAnno.resource = jQuery.grep(oaAnno.resource, function(value) {
            return value["@type"] !== "oa:Tag";
        });
        //re-add tagging if we have them
        if (tags.length > 0) {
            oaAnno.motivation.push("oa:tagging");
            jQuery.each(tags, function(index, value) {
                oaAnno.resource.push({      
                    "@type":"oa:Tag",
                     "chars":value
                });
            });
        }
        jQuery.each(oaAnno.resource, function(index, value) {
            if (value["@type"] === "dctypes:Text") {
                value.chars = resourceText;
            }
        });
        //save to endpoint
        jQuery.publish('annotationUpdated.'+_this.parent.windowId, [oaAnno]);

        _this.unFreezeQtip(api, oaAnno, annoTooltip);
        });
        
        jQuery('.annotation-tooltip a.cancel').on("click", function(event) {
          event.preventDefault();
          var display = jQuery(this).parents('.annotation-tooltip'),
          id = display.attr('data-anno-id'),
          oaAnno = _this.getAnnoFromRegion(id)[0];
   
        _this.unFreezeQtip(api, oaAnno, annoTooltip);
        });

    }
  };
})(Mirador);
