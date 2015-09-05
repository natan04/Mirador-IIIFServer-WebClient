window.InvokerLib = window.InvokerLib || {};
window.InvokerLib.Views = window.InvokerLib.Views || {};

// FuncMenu: accordion style is messy
// 

(function($,Mirador) {


Handlebars.registerHelper('json', function(obj) {
  return JSON.stringify(obj);
});

$.htmlEncode = function(text) {
  return jQuery('<div/>').text(text).html();
};

$.paramView = function(paramObj) {
  
  // General view config for every parameter type:
  // template - template function <object> -> <string>. the parameter object is passed.
  // widgetFunc - any widget function to apply on the paramView element
  // widgetOpts - function <this = paramObj> -> <option object>. for custom options to pass to widget
  // on - Object with event names as keys, handler functions as values
	  var paramsConfig = {
	    'bool': {
	      template: Handlebars.compile('<button data-val="{{value}}">{{value}}</button>'),
	      widgetFunc: jQuery.fn.button,
	      widgetOpts: function() { return {}; },
	      on: {'click': function() {
	                       var el = jQuery(this);
	                       var newVal = (el.attr('data-val').toLowerCase()=='true')?'False':'True';
	                       el.attr('data-val',newVal).find('.ui-button-text').text(newVal);
	                    }
	          }
	    },
	    'int': {
	      template: Handlebars.compile('<div data-val="{{value}}"><div class="param-val">{{value}}</div></div>'),
	      widgetFunc: jQuery.fn.slider,
	      widgetOpts: function() { return {value: this.value};},
	      on: {'slide': function(ev, ui) { jQuery(this).attr('data-val',ui.value).find('.param-val').text(ui.value); } 
	          }
	    }
	  };
	  
	  if (!paramsConfig.hasOwnProperty(paramObj.type)) {
	    return jQuery('<div/>');
	  }
	  var conf = paramsConfig[paramObj.type];
	  var container = jQuery('<div/>').addClass('param-container');
	 
	  var el = jQuery(conf.template(paramObj)).addClass('param-view').attr('data-object',JSON.stringify(paramObj)).appendTo(container);   // convert template to real element
	  
	  if (conf.widgetFunc)
	      conf.widgetFunc.call(el,(conf.widgetOpts.call(paramObj))); // apply widget function with options
	  
	  // Bind events
	  jQuery.each(conf.on, function(eventName,func){
	    el.on(eventName, func);
	  });
	  
	  return container;
  
};

	$.FuncsMenu = function(options) {

		jQuery.extend(this, {
			appendTo: null,
			funcList: [],
			element: null,
			width: 220,
			classItemOptions: {
				showIO: true,
				showParams: true
			},
			layoutOptions: {
				top: -460,
				left: 650,
				draggable: true,
				initialActive: false, // false(collapse) / 0 (opened)
			},
			tooltipsPos: {	my:'left top', 
					at: 'right top', 
					collision: 'none'
				}
		}, options);

		this.init();
	};

	$.FuncsMenu.prototype = {
		init: function() {
			var _this = this;

			jQuery.subscribe('Invoker.List.Success', function(ev, data) {
				console.log('FuncsMenu: parsing functions list');

				_this.funcList = data.funcList;
				_this.element = jQuery(_this.template({ funcs: _this.funcList })).appendTo(_this.appendTo);

				_this.setLayout();
				_this.bindEvents();

				jQuery.unsubscribe('Invoker.List.Success');
			});

			jQuery.unsubscribe('Invoker.List.Fail', function(ev, data) {
				_this.element = null;
			});

			Mirador.ServiceManager.services.invoker.doList();

		},

		bindEvents: function() {
			var _this = this;

			///////////// INVOKE BUTTON ///////////
			jQuery('.invoke-btn').on('click', function(ev){
				var el = jQuery(this);
				  
				var funcName = el.attr('data-func');
				var clsName = el.attr('data-class');
				    
			  	var paramsEl = jQuery(this).parent().find('.param-view').map(function() {
				        var pEl = jQuery(this);
				        var pObj = JSON.parse(pEl.attr('data-object'));
				        pObj.value = pEl.attr('data-val');
				        console.log(this.toString());
				        return pObj; 
				  });
			  
				console.log('FuncsMenu - func/class chosen: ' + funcName +' / ' +clsName + ' Params: ');
				jQuery.each(paramsEl, function(index, paramObj) {
					console.log('Param:  ' + paramObj.name + ' = ' + paramObj.value);
				});


				jQuery.publish('Invoker.FuncsMenu.select', {funcName: el.attr('data-func-name'), clsName: el.attr('data-class-name'), params: paramsEl});


			});

		},

		setLayout: function() {
			var _this = this;

			// Update view with parameters views 
			jQuery.each(_this.element.find('.param-container'), function(index, contEl) {
				  var el = jQuery(contEl);
				  var json = el.attr('data-object');
				  var obj = JSON.parse(json);

				  el.replaceWith($.paramView(obj) );
			});


			///////////////////////////// TOOLTIPS SETUP ////////////////////////////

			jQuery('.func-item').tooltip({
				  content: function() { 
				    		el = jQuery(this);
				    		return $.htmlEncode(el.attr('data-input')) + ' -> ' + $.htmlEncode(el.attr('data-output'));
			  		}, 
			  	position: _this.tooltipsPos
			});

			jQuery('.class-item, li.param, .funcs-menu > h3').tooltip({
			  	position: _this.tooltipsPos
			});


			///////////////////////////////// ACCORDIONS SETUP /////////////////////////////////
			jQuery('.funcs-menu').accordion({
				  items: '.func-item',
				  active: _this.layoutOptions.initialActive,
				  collapsible: true,
				  heightStyle: 'auto',
			});

			jQuery('.func-list').accordion({
				  items: '.class-item',
				  heightStyle: 'content',
				  collapsible: true,
				  active: false
			});

			jQuery('.class-list').accordion({
				  items: '.class-item',
				  heightStyle: 'content',
				  collapsible: true,
				  active: false
			});

			// styling of every invoke button
			jQuery('.invoke-btn').button();


			_this.element.find('.funcs-menu .ui-accordion-content').css('padding','5px');	
			_this.element.find('.func-list .ui-accordion-content').css('padding','5px');

			_this.element.css('top',_this.layoutOptions.top).css('left',_this.layoutOptions.left);

			if (_this.layoutOptions.draggable) {
				_this.element.draggable();
			}

			_this.element.width(_this.width);


		},


		template: Handlebars.compile(
			['<div class=\"funcs-menu\">',
			'    <h3 title=\"Click here to select functions\">Functions</h3>',
			'    <div>',
			'      <div class=\"func-list\">',
			'      ',
			'      {{#each funcs}}',
			'        <div class=\"func-item\" title=\"aaa\" data-output=\"{{this.output}}\" data-input=\"{{this.input}}\">{{this.name}}</div>',
			'         <div>',
			'          <div class=\"class-list\">',
			'          ',
			'          {{#each this.classes}}',
			'              <div class=\"class-item\" title=\"{{this.description}}\">{{name}}</div>',
			'              <div>',
			'              ',
			'                 <ul class=\"param-list\">   ',
			'                 {{#each this.parameters}}',
			'                     <li title=\"{{this.Description}}\" class=\"param\">{{this.name}}',
			'                     <div class=\"param-container\" data-object=\"{{json this}}\">a</div>',
			'                     </li>',
			'                 {{/each}}',
			'',
			'             <a class=\"invoke-btn\" href=\"#\" data-func=\"{{../name}}\" data-class=\"{{name}}\">Invoke</a>',
			'',
			'                 </ul>',
			'                 ',
			'              </div>',
			'          {{/each}}',
			'          ',
			'          ',
			'          </div>',
			'        </div>',
			'      {{/each}}',
			'      ',
			'      ',
			'      </div>',
			'      ',
			'      ',
			'      ',
			'    </div>',
			'</div>'].join('\n'))

	};



})(window.InvokerLib.Views, window.Mirador);