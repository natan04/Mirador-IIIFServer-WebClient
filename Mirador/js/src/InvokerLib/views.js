window.InvokerLib = window.InvokerLib || {};
window.InvokerLib.Views = window.InvokerLib.Views || {};

// FuncMenu: accordion style is messy
// 

(function($,Mirador) {

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
			});

			Mirador.ServiceManager.services.invoker.doList();

		},

		bindEvents: function() {
			var _this = this;

			_this.element.find('li.class-item ').on('click',function() {
				el = jQuery(this);

				console.log('FuncsMenu - func/class chosen: ' + el.attr('data-func-name') +' / ' +el.attr('data-class-name'));
				
				jQuery.publish('Invoker.FuncsMenu.select', {funcName: el.attr('data-func-name'), clsName: el.attr('data-class-name')});

			});
		},

		setLayout: function() {
			var _this = this;

			_this.element.accordion({
				header: '.menu-header',
				collapsible: true,
				heightStyle: 'content',
				active: _this.layoutOptions.initialActive

			});

			_this.element.find('.func-list-wrapper').accordion({
				header: '.func-header',
				collapsible: true,
			});

			_this.element.find('.class-list').menu();

			_this.element.find('.func-list.ui-accordion-content').css('padding','3px');	
			_this.element.find('.func-item.ui-accordion-content').css('padding','50px');
			_this.element.css('top',_this.layoutOptions.top).css('left',_this.layoutOptions.left);

			if (_this.layoutOptions.draggable) {
				_this.element.draggable();
			}

			_this.element.width(_this.width);


		},


		template: Handlebars.compile([
			'<div class="funcs-toolbox">',
				'<h4 class="menu-header">Functions</h4>',
				'<div class="func-list">',
				'<div class="func-list-wrapper">',
					'{{#each funcs}}',
						'<h4 class="func-header">{{this.name}}</h4>',
						'<div class="func-item">',
							'<ul class="class-list">',
				      				'{{#each this.classes}}',  
				        					'<li class="class-item" data-func-name="{{../name}}" data-class-name="{{this.name}}">',
				          						'<span>{{this.name}}</span>',
				        					'</li>',
				      				'{{/each}}',
				      			'</ul>',
				   		 '</div>',
				  	'{{/each}}',
				'<div>',
				'</div>',
			'</div>'
			].join('') )
	};



})(window.InvokerLib.Views, window.Mirador);