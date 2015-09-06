window.InvokerLib = window.InvokerLib || {};
window.InvokerLib.Views = window.InvokerLib.Views || {};

//TODO: Flows - init method - create element+fetch data+styling
//TODO: Flows - fetch method - invoker.doList
//TODO: Flows - update - erase inner elements + fetch + restyle
//TODO: Flows - styling - every flow tooltip -> invokes list 
//TODO: FuncsMenu - parameters styling fix
//TODO: Flows - SAVE btn+Input + hide it when not in edit mode(batch)

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
	      template: Handlebars.compile('<button data-val="{{value}}">{{{value}}}</button>'),
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
	      template: Handlebars.compile('<div data-val="{{value}}"><div class="param-val">{{{value}}}</div></div>'),
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
			width: 250,
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
				var paramsArr = [];
				  
				var funcName = el.attr('data-func');
				var clsName = el.attr('data-class');
				
				jQuery.each(jQuery(this).parent().find('.param-view'), function(index, paramEl){
					var pEl = jQuery(paramEl);
					var pObj = JSON.parse(pEl.attr('data-object'));
					pObj.value = pEl.attr('data-val');
					paramsArr.push(pObj);
				});

			  
				console.log('FuncsMenu - func/class chosen: ' + funcName +' / ' +clsName + ' Params: ');
				jQuery.each(paramsArr, function(index, paramObj) {
					console.log('Param:  ' + paramObj.name + ' = ' + paramObj.value);
				});


				jQuery.publish('Invoker.FuncsMenu.select', {funcName: funcName, clsName: clsName, params: paramsArr});


			});

		},

		setLayout: function() {
			var _this = this;

			// Update view with parameters views 
			jQuery.each(_this.element.find('.param-col'), function(index, contEl) {
				  var el = jQuery(contEl);
				  var json = el.attr('data-object');
				  var obj = JSON.parse(json);

				  el.append($.paramView(obj) );
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

			_this.element.find('.funcs-menu .ui-accordion-content').css('padding','5px !important');	
			_this.element.find('.func-list .ui-accordion-content').css('padding','5px !important');

			_this.element.css('top',_this.layoutOptions.top).css('left',_this.layoutOptions.left);

			if (_this.layoutOptions.draggable) {
				_this.element.draggable({handle: 'h3.ui-accordion-header'});
			}

			_this.element.width(_this.width);


		},


		template: Handlebars.compile(
			['<div class=\"funcs-menu\">',
			'    <h3 title=\"Click here to select functions\">Toolbox</h3>',
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
			'                 <table class=\"param-list\">   ',
			'                 {{#each this.parameters}}',
			'	      	<tr title="{{this.Description}}">',
			'			<td class="param">{{this.name}}</td>',
			'			<td class="param-col" data-object="{{json this}}"></td>',
			'		</tr>',
			'                 {{/each}}',
			'',
			'             <a class=\"invoke-btn\" href=\"#\" data-func=\"{{../name}}\" data-class=\"{{name}}\">Invoke</a>',
			'',
			'                 </table>',
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


	$.FlowLoadMenu = function(options) {

		jQuery.extend(this, {
			saveMode: true , // False = batch mode
			appendTo: null,
			flowsList: [],
			element: null,
			width: 220,
			layoutOptions: {
				top: '-400px',
				left: '400px',
				draggable: true,

			}
		}, options);

		this.init();
	};

	$.FlowLoadMenu.prototype = {
		init: function() {
			var _this = this;

			_this.element = jQuery(_this.template({saveMode: _this.saveMode })).appendTo(_this.appendTo);
			
			_this.element.accordion({heightStyle: 'content'});

			_this.element.css('top',_this.layoutOptions.top).css('left',_this.layoutOptions.left);

			if (_this.layoutOptions.draggable) {
				_this.element.draggable({handle: 'h3.ui-accordion-header'});
			}

			_this.element.width(_this.width);

			_this.updateView();




		},
		bindEvents: function () {
			var _this = this;

			_this.element.find('.flow-save-btn').on('click', function(ev) {
				var id = _this.element.find('.flow-save-input').val();

				var idExists = false;
				// Check if flow exists with same id
				jQuery.each(_this.flowsList, function(index, flowObj) {
					if (id === flowObj.id) {
						alert('Flow already exists with that id');
						idExists = true;
					}
				});

				if (!idExists) {
					jQuery.publish('Invoker.FlowList.Save', {id: id});
				}
			});

		},

		updateView: function() {
			var _this = this;

			jQuery.subscribe('Invoker.FlowList.Success', function(ev,data) {
				_this.flowsList = data.flows;

				var listEl = jQuery(_this.flowListTemplate(data));

				if (_this.element.find('.flows-list').length) { // Is it update or first time
					_this.element.find('.flows-list').replaceWith(listEl); 
				} else {
					listEl.appendTo(_this.element.find('> div'));
				}

				jQuery.unsubscribe('Invoker.FlowList.Success');

				// Bind Select event for every flow button
				_this.element.find('a.flow-item').on('click', function(ev){
					var selectId = jQuery(this).attr('data-flow-id');
					console.log('FlowsMenu: selected flow: ' + selectId);
					jQuery.publish('Invoker.FlowsMenu.select', {id: selectId});
				});

				_this.bindEvents();

			});

			Mirador.ServiceManager.services.invoker.doFlowList();

		},


		template: Handlebars.compile([
			'<div class="flows-menu">',
			'	<h3>Flows</h3>',
			'	<div>',
			'	{{#if saveMode}}',
			'		<div class=\"flow-save-container\" >',
			'			<input type=\"text\" placeholder=\"Flow name to save\" class=\"flow-save-input\">',
			'			<button class=\"flow-save-btn\">SAVE</button>',
			'		</div>',
			'	{{/if}}',
			'	</div>',
			'</div>'
			].join('')),

		flowListTemplate: Handlebars.compile([
			'<ul class="flows-list">',
			'{{#each flows}}',
			'	<li><a class="flow-item" href="#" data-flow-id="{{this.id}}">{{this.id}}</a></li>',
			'{{/each}}',
			'</ul>'
			].join(''))

	};

	$.InvokeViewTemplate = Handlebars.compile([
  			'<table class="invoke-info">',
			'	<tbody><th>{{function}}::{{class}}</th></tbody>',
			'	{{#each parameters}}',
			'		<tr>',
			'			<td>{{this.name}}</td>',
			'			<td>{{this.value}}</td>',
			'		</tr>',
			'	{{/each}}',
			'</table>'
			].join(''));


	


})(window.InvokerLib.Views, window.Mirador);