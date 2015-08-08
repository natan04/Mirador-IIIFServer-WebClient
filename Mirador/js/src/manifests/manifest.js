(function($){

/*
  Manifest Class Version conversion: 
    added versions field object, key:vernum,  value:json manifest
    loading&fetching: if already multi -> choose first(need tweaking)
                        if single -> convert to one-version, choose first

 */


  // DONE: Manifest class: add versions array + array/object checking.
  // DONE: Convert versions array to {vernum: , title: , manifest: } object
  // TODO: Manifest class: add versions traverse functions. + indexing

  $.Manifest = function(manifestUri, location) {

    jQuery.extend(true, this, {
      jsonLd: null,       // Current loaded version
      versions: null,     // versions: {vernum: <version no.>, title: <title>, manifest: <manifest object> }
      location: location,
      uri: manifestUri,
      type: "",
      request: null 
    });

    this.init(manifestUri);
  };

  $.Manifest.prototype = {
    init: function(manifestUri) {
      var _this = this;
      this.request = jQuery.ajax({
        url: manifestUri,
        dataType: 'json',
        async: true
      });

      this.request.done(function(jsonLd) {
        console.log("Manifest Loader: DONE fetching. Checking if manifest has multiple versions...");

        // TODO: Multiver manifest: load most recently version(currently by 1st index)
        // Check if we got array(multiple versions).
        if (Object.prototype.toString(jsonLd) == '[object Array]') {
          console.log("Manifest Loader: Multiple versions. assigning first version");
          _this.versions = jsonLd;
          _this.versions = _this.convertVersionsToObject(jsonLd);
          _this.switchToVersionByIndex(0);

        } else {
          console.log("Manifest Loader: Single version. converting...");
          _this.versions = {0: jsonLd};
          _this.switchToVersionByIndex(0);
        }
      });
    },

    convertVersionsToObject : function(ver_array) {
      versions_obj = {};
      jQuery.each(ver_array, function(index, manifest){
          var vernum = manifest.vernum;
          versions_obj[vernum] = manifest;
      });

      return versions_obj;

    },

    switchToVersion : function(ver) {
      this.jsonLd = this.versions[ver]; // TODO: SwitchToVersion event publishing(change/reloaded)
      // TODO: SwithToVersion - safety for falsy version parameter

    },
    switchToVersionByIndex : function(idx) {
      var key_vernum = Object.keys(this.versions)[idx];
      this.switchToVersion(key_vernum);
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
    }
  };

}(Mirador));
