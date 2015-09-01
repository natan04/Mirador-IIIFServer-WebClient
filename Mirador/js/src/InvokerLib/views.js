window.InvokerLib = window.InvokerLib || {};
window.InvokerLib.Views = window.InvokerLib.Views || {};


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

			_this.element.find('li.class-item a ').on('click',function() {
				el = jQuery(this);

				console.log('FuncsMenu - func/class chosen: ' + el.attr('data-func-name') +' / ' +el.attr('data-class-name'));
				
				jQuery.publish('Invoker.FuncsMenu.select', {funcName: el.attr('data-func-name'), clsName: el.attr('data-class-name')});

			});
		},

		setLayout: function() {

			_this.element.accordion({
				header: '.menu-header',
				collapsible: true,
				heightStyle: 'content'
			});

			_this.element.find('.func-list').accordion({
				header: '.func-header',
				collapsible: true
			});

			_this.element.find('.class-list').menu();

			_this.element.find('.func-list.ui-accordion-content').css('padding','3px');	
			_this.element.find('.func-item.ui-accordion-content').css('padding','0px');


			_this.element.width(_this.width);
		},


		template: Handlebars.compile([
			'<h4>Functions</h4>',
			'<div class="func-list">',
				'{{#each funcs}}',
					'<h4 class="func-header">{{this.name}}</h4>',
					'<div class="func-item">',
						'<ul class="class-list">',
			      				'{{#each this.classes}}',  
			        					'<li class="class-item" data-func-name="{{../name}}" data-class-name="{{this.name}}">',
			          						'<span><a href="#">{{this.name}}</a></span>',
			        					'</li>',
			      				'{{/each}}',
			      			'</ul>',
			   		 '</div>',
			  	'{{/each}}',
			'</div>'
			].join('') )
	};



})(window.InvokerLib.Views, window.Mirador);