(function($) {
//TODO: Version select with arrow buttons
//TODO: Version select - enlarge font or add mouseover to enlarge

  $.ManifestListItem = function(options) {

    jQuery.extend(true, this, {
      element:                    null,
      parent:                     null,
      manifest:                   null,
      loadStatus:                 null,
      thumbHeight:                80,
      urlHeight:                  150,
      resultsWidth:               0,  // based on screen width
      maxPreviewImagesWidth:      0,
      repoWidth:                  80,
      metadataWidth:              200,
      margin:                     15,
      remainingItemsMinWidth:     80, // set a minimum width for the "more" image
      imagesTotalWidth:           0,
      tplData:                    null
    }, options);

    this.init();

  };

  $.ManifestListItem.prototype = {

    init: function() {
      var _this = this;
      //need a better way of calculating this because JS can't get width and margin of hidden elements, so must manually set that info
      //ultimately use 95% of space available, since sometimes it still displays too many images
      if (this.element) 
          this.imagesTotalWidth = 0;

      this.maxPreviewImagesWidth = this.resultsWidth - (this.repoWidth + this.margin + this.metadataWidth + this.margin + this.remainingItemsMinWidth);
      this.maxPreviewImagesWidth = this.maxPreviewImagesWidth * 0.95;

      this.fetchTplData(this.manifestId);

      // Check if this is a refresh (replace element if this is the case)
      if (!this.element) {
          this.element = jQuery(this.template(this.tplData)).prependTo(this.parent.manifestListElement).hide().fadeIn('slow');
      } else {
          newEl = jQuery(this.template(this.tplData));
          this.element.replaceWith(newEl);
          this.element = newEl;
      }

      var remainingOffset = this.repoWidth + this.margin + this.metadataWidth + this.margin + this.imagesTotalWidth;
      this.element.find('.remaining-items').css('left', remainingOffset);

      this.bindEvents();

    },

    fetchTplData: function() {
      var _this = this,
      location = _this.manifest.location,
      manifest = _this.manifest.jsonLd;

      this.tplData = { 
        label: manifest.label,
        repository: location,
        canvasCount: manifest.sequences[0].canvases.length,
        images: [],
        versions: _this.manifest.getVersionsSummary(),
        commands: []
      };

      this.tplData.repoImage = (function() {
        var repo = _this.tplData.repository;
        if (manifest.logo) {
          if (typeof manifest.logo === "string")
            return manifest.logo;
          if (typeof manifest.logo['@id'] !== 'undefined')
            return manifest.logo['@id'];
        }
        if (_this.tplData.repository === '(Added from URL)') {
          repo = '';
        }            
        var imageName = $.viewer.repoImages[repo || 'other'] || $.viewer.repoImages.other;

        return $.viewer.logosLocation + imageName;
      })();

      for ( var i=0; i < manifest.sequences[0].canvases.length; i++) {
        var canvas = manifest.sequences[0].canvases[i];
        if (canvas.width === 0) {
          continue;
        }

        var aspectRatio = canvas.height/canvas.width,
        width = (_this.thumbHeight/aspectRatio);
        url = _this.manifest.getThumbnailForCanvas(canvas, width);

        _this.imagesTotalWidth += (width + _this.margin);
        if (_this.imagesTotalWidth >= _this.maxPreviewImagesWidth) {
          _this.imagesTotalWidth -= (width + _this.margin);
          break;
        }

        this.tplData.images.push({
          url: url,
          width: width,
          height: _this.thumbHeight,
          id: canvas['@id']
        });
      }

      this.tplData.remaining = (function() {
        var remaining = manifest.sequences[0].canvases.length - _this.tplData.images.length;
        if (remaining > 0) {
          return remaining;
        }
      })();

      this.tplData.commands.push({title: 'refresh', class:'command-refresh', icon:'http://uxrepo.com/static/icon-sets/ionicons/svg/refresh.svg', iconWidth:'25'});
      //this.tplData.commands.push({title: 'refresh', class:'command-refresh', icon:'http://uxrepo.com/static/icon-sets/ionicons/svg/refresh.svg', iconWidth:'25'});
      //this.tplData.commands.push({title: 'refresh', class:'command-refresh', icon:'http://uxrepo.com/static/icon-sets/ionicons/svg/refresh.svg', iconWidth:'25'});
      //this.tplData.commands.push({title: 'refresh', class:'command-refresh', icon:'http://uxrepo.com/static/icon-sets/ionicons/svg/refresh.svg', iconWidth:'25'});


    },

    render: function() {

    },

    bindEvents: function() {
      var _this = this;

      this.element.find('.manifest-update-btn').on('click', function() {
        _this.init();
      });

      this.element.find('img').on('load', function() {
        //if img width is not equal to the width in the html, change height
        jQuery(this).hide().fadeIn(600);
      });

      this.element.on('click', function() {
        var windowConfig = {
          manifest: _this.manifest,
          currentCanvasID: null,
          currentFocus: 'ThumbnailsView'
        };
        $.viewer.workspace.addWindow(windowConfig);
      });

      this.element.find('.manifest-version-row').on('click', function(e){
        e.stopPropagation();
        el = jQuery(this);
                
        var title = el.attr('data-version-title');
        
        _this.manifest.switchToVersionByTitle(title);
        _this.init();
      });

      this.element.find('.preview-image').on('click', function(e) {
        e.stopPropagation();
        var windowConfig = {
          manifest: _this.manifest,
          currentCanvasID: jQuery(this).attr('data-image-id'),
          currentFocus: 'ImageView'
        };
        $.viewer.workspace.addWindow(windowConfig);
      });

      jQuery.subscribe('manifestPanelWidthChanged', function(event, newWidth){
        var newMaxPreviewWidth = newWidth - (_this.repoWidth + _this.margin + _this.metadataWidth + _this.margin + _this.remainingItemsMinWidth);
        newMaxPreviewWidth = newMaxPreviewWidth * 0.95;
        if (newMaxPreviewWidth < _this.maxPreviewImagesWidth ) {
          while (_this.imagesTotalWidth >= newMaxPreviewWidth) {
            image = _this.tplData.images.pop();
            _this.imagesTotalWidth -= (image.width + _this.margin);

            //remove image from dom
            _this.element.find('img[data-image-id="'+image.id+'"]').remove();
            var remainingOffset = _this.repoWidth + _this.margin + _this.metadataWidth + _this.margin + _this.imagesTotalWidth;

            //increase remaining # by 1
            var remaining = _this.element.find('.remaining-amount');
            var newRemaining;
            if (remaining.length > 0) {
              newRemaining = parseInt(remaining[0].innerHTML, 10) + 1;
              remaining[0].innerHTML = newRemaining;
            } else {
              //add the remaining element
              newRemaining = 1;
              _this.element.find('.preview-images').after('<div class="remaining-items"><h3><span class="remaining-amount">'+newRemaining+'</span> more</h3></div>');
            }

            //update size of "More" icon
            _this.element.find('.remaining-items').css('left', remainingOffset);
          }
        }
        _this.maxPreviewImagesWidth = newMaxPreviewWidth;
      });
    },

    hide: function() {
      var _this = this;
    },

    show: function() {
      var _this = this;
    },

    template: Handlebars.compile([
                                 '<li>',
                                 '<div class="repo-image">',
                                    '<img src="{{repoImage}}" alt="repoImg">',
                                 '</div>',
                                 '<div class="select-metadata">',
                                    '<h3 class="manifest-title">{{label}}</h3>',
                                    '<h4>{{canvasCount}} {{t "items"}}</h4>',
                                    '{{#if repository}}',
                                    '<h4 class="repository-label">{{repository}}</h4>',
                                    '{{/if}}',
                                    '<div class="manifest-revisions">',
                                        '<h3>Versions</h3>',
                                        '<table>',
                                            '<thead>',
                                                '<tr>',
                                                    '<td>No.</td>',
                                                    '<td>Title</td>',
                                                '</tr>',
                                            '</thead>',
                                            '<tbody>',
                                                '{{#each versions}}',
                                                '<tr class="manifest-version-row{{#if this.selected}} version-selected{{/if}}" data-version-title="{{this.title}}">', // TODO: Revisions -> convert to useful links
                                                    '<td>{{this.num}}</td>',
                                                    '<td>{{this.title}}</td>',
                                                '</tr>',
                                                '{{/each}}',
                                        '</table>',
                                    '</div>',
                                 '</div>',
                                 '<div class="preview-images">',
                                    '{{#each images}}',
                                    '<img src="{{url}}" width="{{width}}" height="{{height}}" class="preview-image flash" data-image-id="{{id}}">',
                                    '{{/each}}',
                                 '</div>',
                                 '{{#if remaining}}',
                                 '<div class="remaining-items"><h3><span class="remaining-amount">{{remaining}}</span> {{t "more"}}</h3></div>',
                                 '{{/if}}',
                                 '<div class="manifest-commands">',
                                  '{{#each commands}}',
                                          '<a href="#" class="manifest-cmd {{this.class}}">',
                                              '<img class="cmd-icon" alt="{{this.title}}" width="{{this.iconWidth}}" src="{{this.icon}}"></img>',
                                          '</a>', 
                                  '{{/each}}',
                                 '</div>',

                                 '</li>'
    ].join(''))
  };

}(Mirador));

