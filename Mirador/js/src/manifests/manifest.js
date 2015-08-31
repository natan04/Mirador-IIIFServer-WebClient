(function($){

/*
  Manifest Class Version conversion: 
    added versions field object, key:vernum,  value:json manifest
    loading&fetching: if already multi -> choose first(need tweaking)
                        if single -> convert to one-version, choose first

    Multiversion manifest format:   
    {"default": { 
                  "index": 0,
                  "IIIF" : { <Manifest Obj>}  },
     "Version1 title": { "index": 1, "IIIF": {...}   },
     "Version2 title": { "index": 2, "IIIF": {...} }
    }

 */

  // DONE: Manifest class: add versions array + array/object checking.
  // DONE: Convert versions array to {vernum: , title: , manifest: } object
  // DONE: Manifest clone with single image (for edit mode)

  // TODO: Manifest class: add versions traverse functions. + indexing

  $.Manifest = function(manifestUri, location) {

    jQuery.extend(true, this, {
      jsonLd: null,       // Current loaded version
      versions: null,     // versions: {"default": { idx: ... , IIIF: }}
      currentVersionTitle: "",
      location: location,
      uri: manifestUri,
      type: "",
      request: null 
    });

    if (manifestUri){
        this.init(manifestUri);
    }
  };

  $.Manifest.prototype = {
    init: function(manifestUri) {
      var _this = this;
      var ajaxObj = {
          url: manifestUri,
          dataType: 'json',
          async: true,
        };
        //TODO: REMOVE xhrFields for production
      if (manifestUri.indexOf('PictureHandler') > -1) {
          ajaxObj.xhrFields = { withCredentials: true};
      }

      this.request = jQuery.ajax(ajaxObj);

      this.request.done(function(jsonLd) {
        console.log("Manifest Loader: DONE fetching url "+manifestUri+".");

        // DONE: Multiver manifest: load most recently version(currently by 1st index)
        // Check if we got multiver(multiple versions).
        if (jsonLd.hasOwnProperty('default')) {
            console.log("Manifest Loader: Multiple versions. assigning last version");
            _this.versions = jsonLd;
            _this.switchToLastVersion();
        } else {
            console.log("Manifest Loader: Single version. converting...");
            _this.versions = {'default': {'index':0, 'IIIF': jsonLd }};
        }
        _this.switchToLastVersion();

      });
    },

    switchToVersionByTitle : function(ver_title) {
      this.jsonLd = this.versions[ver_title].IIIF; // TODO: SwitchToVersion event publishing(change/reloaded)
      this.currentVersionTitle = ver_title;
      // TODO: SwithToVersion - safety for falsy version parameter

    },

    getLastVerTitle : function() {
        var currentMax = 0;
        var currentTitle = "";

        jQuery.each(this.versions, function(verTitle,manifest) {
          if (manifest.index >= currentMax) {
            currentMax = manifest.index;
            currentTitle = verTitle;
          }

        });

        return currentTitle;
    },
    switchToLastVersion : function() {
      var lastTitle = this.getLastVerTitle();
      console.log("Manifest Loader: switching to last version: " + lastTitle);
      this.switchToVersionByTitle(lastTitle);
    },

    getVersionsSummary : function() {
      var _this = this;
      vers = [];

      jQuery.each(this.versions, function(verTitle,manifest) {
        selectedVersion = (verTitle == _this.currentVersionTitle);
        vers.push({num: manifest.index, title: verTitle, selected: selectedVersion});
      });

      return vers;
    },

    getThumbnailForCanvas : function(canvas, width) {
      var version = "1.1",
      service,
      thumbnailUrl;

      // Ensure width is an integer...
      width = parseInt(width, 10);

      // Respecting the Model...
      if (canvas.hasOwnProperty('thumbnail')) {
        // use the thumbnail image, prefer via a service
        if (typeof(canvas.thumbnail) == 'string') {
          thumbnailUrl = canvas.thumbnail;
        } else if (canvas.thumbnail.hasOwnProperty('service')) {
          // Get the IIIF Image API via the @context
          service = canvas.thumbnail.service;
          if (service.hasOwnProperty('@context')) {
            version = $.Iiif.getVersionFromContext(service['@context']);
          }
          thumbnailUrl = $.Iiif.makeUriWithWidth(service['@id'], width, version);
        } else {
          thumbnailUrl = canvas.thumbnail['@id'];
        }
      } else {
        // No thumbnail, use main image
        var resource = canvas.images[0].resource;
        
        if(!resource.hasOwnProperty('service') ) {
          return resource['@id'];
        }

        service = resource['default'] ? resource['default'].service : resource.service;
        if (service.hasOwnProperty('@context')) {
          version = $.Iiif.getVersionFromContext(service['@context']);
        }          
        thumbnailUrl = $.Iiif.makeUriWithWidth(service['@id'], width, version);
      }
      return thumbnailUrl;
    },
    getCanvases : function() {
      var _this = this;
      return _this.jsonLd.sequences[0].canvases;
    },
    getAnnotationsListUrl: function(canvasId) {
      var _this = this;
      var canvas = jQuery.grep(_this.getCanvases(), function(canvas, index) {
        return canvas['@id'] === canvasId;
      })[0];

      if (canvas && canvas.otherContent) {
        return canvas.otherContent[0]['@id'];
      } else { return false; }
    },
    getStructures: function() {
      var _this = this;
      return _this.jsonLd.structures;
    },

    cloneWithSingleByIndex: function(canvasIdx) {
        var canvasId = this.getCanvases()[canvasIdx];
        return this.cloneWithSingleById(canvasId);
    },
    getCanvasById: function(canvasId) {
        var _this = this;
        var canvas = jQuery.grep(_this.getCanvases(), function(canvas, index) {
          return canvas['@id'] === canvasId;
        })[0];
        return canvas;
    },

    cloneWithSingleById: function(canvasId) {
        var _this = this;
        var newManifest = new $.Manifest('','');

        canvas = this.getCanvasById(canvasId);

        // Deep copy given canvas
        canvasCopy = jQuery.extend(true, {}, canvas);

        // Deep copy manifest json
        newManifest.jsonLd = jQuery.extend(true, {}, _this.jsonLd);
        
        // Erase canvases and add only the given canvas
        newManifest.jsonLd.sequences[0].canvases = [];
        newManifest.jsonLd.sequences[0].canvases.push(canvasCopy);

        newManifest.versions = {'default': {'index':0, 'IIIF': jsonLd }};
        newManifest.currentVersionTitle = 'default';
        
        return newManifest;
    }






  };

}(Mirador));
