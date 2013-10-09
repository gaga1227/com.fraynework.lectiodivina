/* ------------------------------------------------------------------------------ */
/* App - view */
/* ------------------------------------------------------------------------------ */
window.App = (function(app){

	//create empty App obj if none found
	var App = app || {},
		Scroller;

	/* ------------------------------------------------------------------------------ */
	/* view */
	App.view = {

		//branch
		branch: '',

		//lastViewedDay
		lastViewedDay: App.utils.getToday(),

		//touch delay
		touchDelay: 100,

		//initButtonsEvents
		initButtonsEvents: function() {
			var $doc = $(document);
			//common
			$doc.on('touchstart', '[data-role="button"]', function(e) {
					console.log('----------------');
					console.log('e:touchstart');
					var $this = $(this);
					$this.data('touchend', false);
					setTimeout( function(){
						if ( !$this.data('touchmove') && !$this.data('touchend') ) {
							$this.addClass('active');
						}
					}, App.view.touchDelay );
				})
				.on('touchmove', '[data-role="button"]', function(e) {
					console.log('e:touchmove');
					$(this)
						.data('touchmove', true)
						.removeClass('active');
				})
				.on('touchend', '[data-role="button"]', function(e) {
					console.log('e:touchend');
					$(this)
						.data('touchmove', false)
						.data('touchend', true)
						.removeClass('active');
				})
				.on('tap', '[data-role="button"]', function(e) {
					console.log('e:tap');
				})
				.on('longTap', '[data-role="button"]', function(e) {
					console.log('e:longTap');
				})
				.on('click', '[data-role="button"]', function(e) {
					console.log('e:click');
				});
		},

		//initExternalLinks
		initExternalLinks: function(){
			$(document).on('click', '[data-link=external]', function(e){
				e.preventDefault();
				var $link = $(this),
					href = $link.attr('href');
				window.open(href, '_blank', 'location=yes,closebuttoncaption=Close,enableViewportScale=yes,transitionstyle=fliphorizontal');
			});
		},

		//initScroller (requires FTScroll/iScroll)
		initScroller: function(){
			var	$container = $('[data-role=scroller]');
			if (!$container.length) { return 'no scroller container found'; }
			if ($.os.ios) { return 'iOS uses native scrolling'; }
			//destroy plugin scroller
			if (Scroller) Scroller.destroy();
			//init scrolling plugin
			if (typeof(FTScroller) == 'function') {
				Scroller = new FTScroller($container[0], {
					scrollingX: 			false,
					scrollbars: 			true,
					updateOnChanges: 		true,
					bouncing:				false
				});
			}
		},

		//initCtrlToggle
		initCtrlToggle: function(){
			//vars
			var	$ctrls = $('[data-ctrl-type=toggle]'),
				activeCls = 'activated';
			//fallback
			if (!$ctrls.length) {
				return 'no toggle ctrl found!';
			}
			//bind event
			$ctrls.map(function(){
				var $ctrl = $(this);
				$ctrl.on('click', function(e){
					e.preventDefault();
					$ctrl.toggleClass(activeCls);
					if ( $ctrl.siblings().length ) {
						$ctrl.siblings().removeClass(activeCls);
					}
				});
			});
		},

		//initPageSlider
		slider: new PageSlider( $('#container') ),
		initPageSlider: function (){
			//skip slicing files
			if ( window.location.href.indexOf('slicing') != -1 ) return false;
			//hashchange event handler
			function route(e) {
				var url = App.utils.getURLFromHash(),
					params = App.utils.getVarsFromSearch();
				App.data.getPage( url, params.dir );
			}
			//bind hashchange events
			$(window).on('hashchange', route);
			//kick-off initial update
			route();
		},

		//initFlickable
		initFlickable: function($tgt, $seg, custOpts){
			//check dependency
			if ( typeof($.fn.flickable) != 'function' ) {
				return 'flackable plugin NOT loaded';
			}
			if (!$tgt.length || $seg.length <= 1) {
				return 'Fail to init flickable';
			}

			//vars
			var vpW = $(document).width(),
				segNum = $seg.length,
				opts = $.extend(
				{
					segments: segNum,
					onScroll: function(e, seg){
						//updating tab states
						var $navTabs = $('#pgAgenda').find('.navTabs'),
							$tgtTab = $navTabs.find('.btnTab').eq(seg),
							currentCLS = 'current';
						//update tab states
						$tgtTab.addClass(currentCLS)
						.siblings('.btnTab').removeClass(currentCLS);
						//update last viewed day
						App.view.lastViewedDay = seg + 1;
					}
				}, custOpts);

			//update dimension
			$tgt.width( Math.ceil(vpW * segNum) );
			$seg.width( vpW );

			//init flickable
			$tgt.flickable( opts );
		},
		
		//initSectionScroller
		initSectionScroller: function($tgt, $seg, custOpts){
			//check dependency
			if ( typeof(FTScroller) != 'function' ) {
				return 'FTScroller plugin NOT loaded';
			}
			if (!$tgt.length || $seg.length <= 1) {
				return 'Fail to init FTScroller';
			}

			//vars
			var segW = $(document).width(),
				segH = $tgt.parent('[data-role="page"]').height(),
				segNum = $seg.length,
				opts = $.extend(
				{
					scrollingY:		false,
					snapping: 		true,
					paginatedSnap:	true,
					scrollbars:		false
				}, custOpts);
			
			//update dimension
			$tgt.find('[data-role="wrapper"]').width( Math.ceil(segW * segNum) );
			$seg.width( segW );
			$seg.height( segH );
			
			//init FTScroller
			if (this.weeksScroller) { this.weeksScroller.destroy(); }
			this.weeksScroller = new FTScroller($tgt[0], opts);
		},

		//initHomeIntro
		initHomeIntro: function( $page ){
			$page.find('.nav, .navExtra, .intro').addClass('active');
		},

		//initPage
		initPage: function( $page ){
			var pageID = $page.attr('id');
			console.log( 'page load: ' + pageID );
			//common
			//App.view.initScroller();
			//home
			if ( pageID == 'pgHome' ) {
				//update global nav style
				$('#nav').addClass('compact');
				//trigger home intro
				setTimeout(App.view.initHomeIntro, 100, $page);
			}
			//weeks
			else if ( pageID == 'pgWeeks' ) {
				//update global nav style
				$('#nav').removeClass('compact');
				//update branch
				App.view.branch = '#weeks';
				//init section scroller for weeks
				this.initSectionScroller($page.find('.sectionScroller'), $page.find('[data-role="section"]'), {});
				//init navTabs
				(function(){
					//vars
					var Scroller = App.view.weeksScroller,
						$navTabs = $('#nav'),
						$btnTabs = $navTabs.find('.navItem'),
						currentCLS = 'current';
					//Scroller events
					Scroller.addEventListener('segmentdidchange', function(e){
						var $currentTab = $($btnTabs[Scroller.currentSegment.x]);
						$currentTab.addClass(currentCLS);
						$currentTab.siblings('.navItem').removeClass(currentCLS);
					});
					//bind tab btn handler
					$btnTabs.off('tap');
					$btnTabs.on('tap', function(e){
						e.preventDefault();
						//exit if click on current btn
						if ( $(this).hasClass(currentCLS) ) { return false; }
						//vars
						var $this = $(this),
							$btnTabCurrent = $navTabs.find('.' + currentCLS),
							currentIdx = $btnTabCurrent.index(),
							tgtIdx = $this.index(),
							offsetLeft = tgtIdx * $(document).width();
						//trigger scrolling
						Scroller.scrollTo(offsetLeft, 0, true);
						console.log(Scroller);
						console.log('[weeksScroller]', 'seg:' + tgtIdx, 'offset:' + offsetLeft);						
						//update tabs
						$this.addClass(currentCLS);
						$this.siblings('.navItem').removeClass(currentCLS);
						// */
					})
					//ignore click events
					$btnTabs.off('click');
					$btnTabs.on('click', function(e){ e.preventDefault(); });
					//manual trigger to scroll to first tab
					$($btnTabs[0]).trigger('tap');
				})();
			}
			//intro
			else if ( pageID == 'pgIntro' ) {
				//update global nav style
				$('#nav').addClass('compact');
				//update branch
				App.view.branch = App.utils.getBranchFromHash();
			}
			//all others
			else {
				//update global nav style
				$('#nav').addClass('compact');
			}
		},

		//initPageShown
		initPageShown: function( $page ){
			var pageID = $page.attr('id');
			console.log( 'page shown: ' + pageID );
			//home
			if ( pageID == 'pgHome' ) {
				//trigger home intro
				App.view.initHomeIntro($page);
			}
		},

		//toggleLoader
		toggleLoader: function(showflag) {
			var $loader = $('#loader'),
				activeCls = 'active';
			showflag ? $loader.addClass(activeCls) : $loader.removeClass(activeCls);
		},

		/* ------------------------------------------------------------------------------ */
		//function - init
		init: function(){
			//alert('app.view.init()');
			this.initButtonsEvents();
			this.initExternalLinks();
			//this.initCtrlToggle();
			this.initPageSlider();
		}

	};

	return App;

})(window.App);
