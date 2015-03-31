(function($) {

  $.BookView = function(options) {

    jQuery.extend(this, {
      currentImg:       null,
      windowId:         null,
      currentImgIndex:  0,
      stitchList:       [],
      canvasID:          null,
      imagesList:       [],
      element:          null,
      focusImages:      [],
      manifest:         null,
      viewingDirection: 'left-to-right',
      viewingHint:      'paged',
      osd:              null,
      osdCls:           'mirador-osd',
      osdOptions: {
        osdBounds:        null,
        zoomLevel:        null
      },
      parent:           null,
      stitchTileMargin: 10
    }, options);

    this.init();
  };


  $.BookView.prototype = {

    init: function() {
      if (this.canvasID !== null) {
        this.currentImgIndex = $.getImageIndexById(this.imagesList, this.canvasID);
      }

      if (!this.osdOptions) {
        this.osdOptions = {
          osdBounds:        null,
          zoomLevel:        null
        };
      }

      this.currentImg = this.imagesList[this.currentImgIndex];

      this.element = jQuery(this.template()).appendTo(this.appendTo);
      this.hud = new $.Hud({
        parent: this,
        element: this.element,
        bottomPanelAvailable: this.bottomPanelAvailable,
        windowId: this.windowId,
        annotationLayerAvailable: false
      });

      if (this.manifest.jsonLd.sequences[0].viewingDirection) {
        this.viewingDirection = this.manifest.jsonLd.sequences[0].viewingDirection.toLowerCase();
      }
      if (this.manifest.jsonLd.sequences[0].viewingHint) {
        this.viewingHint = this.manifest.jsonLd.sequences[0].viewingHint.toLowerCase();
      }

      this.stitchList = this.getStitchList();
      this.createOpenSeadragonInstance();
    },

    template: Handlebars.compile([
                                 '<div class="book-view">',
                                 '</div>'
    ].join('')),

    setBounds: function() {
      var _this = this;
      this.osdOptions.osdBounds = this.osd.viewport.getBounds(true);
      jQuery.publish("imageBoundsUpdated", {
        id: _this.parent.id, 
        osdBounds: {x: _this.osdOptions.osdBounds.x, y: _this.osdOptions.osdBounds.y, width: _this.osdOptions.osdBounds.width, height: _this.osdOptions.osdBounds.height}
      });
    },

    toggle: function(stateValue) {
      if (stateValue) { 
        this.show(); 
      } else {
        this.hide();
      }
    },

    hide: function() {
      jQuery(this.element).hide({effect: "fade", duration: 1000, easing: "easeOutCubic"});
    },

    show: function() {
      jQuery(this.element).show({effect: "fade", duration: 1000, easing: "easeInCubic"});
    },

    adjustWidth: function(className, hasClass) {
      if (hasClass) {
        this.parent.element.find('.view-container').removeClass(className);
      } else {
        this.parent.element.find('.view-container').addClass(className);
      }
    },

    adjustHeight: function(className, hasClass) {
      if (hasClass) {
        this.element.removeClass(className);
      } else {
        this.element.addClass(className);
      }
    },

    updateImage: function(canvasID) {
      this.canvasID = canvasID;
      this.currentImgIndex = $.getImageIndexById(this.imagesList, this.canvasID);
      this.currentImg = this.imagesList[this.currentImgIndex];
      var newList = this.getStitchList();
      var is_same = this.stitchList.length == newList.length && this.stitchList.every(function(element, index) {
        return element === newList[index]; 
      });
      if (!is_same) {
        this.stitchList = newList;
        this.osdOptions = {
          osdBounds:        null,
          zoomLevel:        null
        };
        this.osd.close();
        this.createOpenSeadragonInstance();
      }
    },

    createOpenSeadragonInstance: function() {
      var uniqueID = $.genUUID(),
      osdId = 'mirador-osd-' + uniqueID,
      osdToolBarId = osdId + '-toolbar',
      elemOsd,
      tileSources = [],
      _this = this,
      toolbarID = 'osd-toolbar-' + uniqueID,
      dfd = jQuery.Deferred();

      this.element.find('.' + this.osdCls).remove();

      jQuery.each(this.stitchList, function(index, image) {
        var imageUrl = $.Iiif.getImageUrl(image),
        infoJsonUrl = imageUrl + '/info.json';

        jQuery.getJSON(infoJsonUrl).done(function (data, status, jqXHR) {
          tileSources.splice(index, 0, data);
          if (tileSources.length === _this.stitchList.length ) { dfd.resolve(); }
        });
      });

      dfd.done(function () {
        var aspectRatio = tileSources[0].height / tileSources[0].width;

        elemOsd =
          jQuery('<div/>')
        .addClass(_this.osdCls)
        .attr('id', osdId)
        .appendTo(_this.element);

        _this.osd = $.OpenSeadragon({
          'id':           elemOsd.attr('id'),
          'toolbarID' : toolbarID
        });

        _this.osd.addHandler('open', function(){
          _this.addLayer(tileSources.slice(1), aspectRatio);
          var addItemHandler = function( event ) {
            _this.osd.world.removeHandler( "add-item", addItemHandler );
            if (_this.osdOptions.osdBounds) {
              var rect = new OpenSeadragon.Rect(_this.osdOptions.osdBounds.x, _this.osdOptions.osdBounds.y, _this.osdOptions.osdBounds.width, _this.osdOptions.osdBounds.height);
              _this.osd.viewport.fitBounds(rect, true);
            } else {
              _this.osd.viewport.goHome(true);
            }
          };

          _this.osd.world.addHandler( "add-item", addItemHandler );

          _this.osd.addHandler('zoom', $.debounce(function(){
            _this.setBounds();
          }, 300));

          _this.osd.addHandler('pan', $.debounce(function(){
            _this.setBounds();
          }, 300));
        });

        _this.osd.open(tileSources[0], {opacity:1, x:0, y:0, width:1});
      });

    },

    addLayer: function(tileSources, aspectRatio) {
      var _this = this;
      jQuery.each(tileSources, function(index, value) {
        var newAR = (value.height / value.width);
        var options = {
          tileSource: value,
          opacity: 1,
          x: 1.01,
          y: 0,
          width: aspectRatio / newAR
        };
        _this.osd.addTiledImage(options);
      });
    },

    // next two pages for paged objects
    // need next single page for lining pages up
    // don't need for continuous or individuals
    next: function() {
      var next;
      if (this.currentImgIndex % 2 === 0) {
        next = this.currentImgIndex + 1;
      } else {
        next = this.currentImgIndex + 2;
      }
      if (next < this.imagesList.length) {
        this.parent.setCurrentCanvasID(this.imagesList[next]['@id']);
      }
    },

    // previous two pages for paged objects
    // need previous single page for lining things up
    // don't need for continuous or individuals
    previous: function() {
      var prev;
      if (this.currentImgIndex % 2 === 0) {
        prev = this.currentImgIndex - 2;
      } else {
        prev = this.currentImgIndex - 1;
      }
      if (prev >= 0) {
        this.parent.setCurrentCanvasID(this.imagesList[prev]['@id']);
      }
    },

    getStitchList: function() {
      // Need to check metadata for object type and viewing direction
      // Default to 'paged' and 'left-to-right'
      // Set index(es) for any other images to stitch with selected image
      var stitchList = [],
      leftIndex = [],
      rightIndex = [],
      topIndex = [],
      bottomIndex = [],
      _this = this;

      this.focusImages = [];

      if (this.viewingHint === 'individuals') {
        // don't do any stitching, display like an imageView
        stitchList = [this.currentImg];
      } else if (this.viewingHint === 'paged') {
        // determine the other image for this pair based on index and viewingDirection
        if (this.currentImgIndex === 0 || this.currentImgIndex === this.imagesList.length-1) {
          //first page (front cover) or last page (back cover), display on its own
          stitchList = [this.currentImg];
        } else if (this.currentImgIndex % 2 === 0) {
          // even, get previous page.  set order in array based on viewingDirection
          switch (this.viewingDirection) {
            case "left-to-right":
              leftIndex[0] = this.currentImgIndex-1;
            stitchList = [this.imagesList[this.currentImgIndex-1], this.currentImg];
            break;
            case "right-to-left":
              rightIndex[0] = this.currentImgIndex-1;
            stitchList = [this.currentImg, this.imagesList[this.currentImgIndex-1]];
            break;
            case "top-to-bottom":
              topIndex[0] = this.currentImgIndex-1;
            stitchList = [this.imagesList[this.currentImgIndex-1], this.currentImg];
            break;
            case "bottom-to-top":
              bottomIndex[0] = this.currentImgIndex-1;
            stitchList = [this.currentImg, this.imagesList[this.currentImgIndex-1]];
            break;
            default:
              break;
          }
        } else {
          // odd, get next page
          switch (this.viewingDirection) {
            case "left-to-right":
              rightIndex[0] = this.currentImgIndex+1;
            stitchList = [this.currentImg, this.imagesList[this.currentImgIndex+1]];
            break;
            case "right-to-left":
              leftIndex[0] = this.currentImgIndex+1;
            stitchList = [this.imagesList[this.currentImgIndex+1], this.currentImg];
            break;
            case "top-to-bottom":
              bottomIndex[0] = this.currentImgIndex+1;
            stitchList = [this.currentImg, this.imagesList[this.currentImgIndex+1]];
            break;
            case "bottom-to-top":
              topIndex[0] = this.currentImgIndex+1;
            stitchList = [this.imagesList[this.currentImgIndex+1], this.currentImg];
            break;
            default:
              break;
          }
        }
      } else if (this.viewingHint === 'continuous') {
        // TODO: stitch all images together per the viewingDirection
      } else {
        // undefined viewingHint, don't do anything
      }

      //set the focusImages for highlighting in panels
      jQuery.each(stitchList, function(index, image) {
        _this.focusImages.push(image['@id']);
      });
      this.parent.updateFocusImages(this.focusImages);
      return stitchList;
    }
  };

}(Mirador));
