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

		//initHomeIntro
		initHomeIntro: function( $page ){
			$page.find('.nav, .intro').addClass('active');
		},

		//initPage
		initPage: function( $page ){
			var pageID = $page.attr('id');
			console.log( 'page load: ' + pageID );
			//common
			//App.view.initScroller();
			//home
			if ( pageID == 'pgHome' ) {
				//trigger home intro
				setTimeout(App.view.initHomeIntro, 100, $page);
			}
			//agenda
			else if ( pageID == 'pgAgenda' ) {
				//update branch
				App.view.branch = '#agenda';
				//init flickable for agneda days
				this.initFlickable($page.find('.flickableContainer'), $page.find('.flickableItem'), {
					preventDefault:false, moveThreshold:50
				});
				//init navTabs
				(function(){
					//vars
					var $flickable = $page.find('.flickableContainer'),
						$navTabs = $page.find('.navTabs'),
						$btnTabs = $navTabs.find('.btnTab'),
						currentCLS = 'current';
					//bind tab btn handler
					$btnTabs.on('click', function(e){
						e.preventDefault();
						//exit if click on current btn
						if ( $(this).hasClass(currentCLS) ) { return false; }
						//scroll page to top (Android only)
						//if ($.os.android) { document.body.scrollTop = 0; }
						//vars
						var $this = $(this),
							$btnTabCurrent = $navTabs.find('.' + currentCLS),
							currentIdx = $btnTabCurrent.index(),
							tgtIdx = $this.index(),
							steps = Math.abs(tgtIdx - currentIdx);
						//trigger flackable scrolling
						if (tgtIdx > currentIdx) {
							$flickable.flickable('scrollNext');
							if (steps > 1) { $flickable.flickable('scrollNext'); }
						} else {
							$flickable.flickable('scrollPrev');
							if (steps > 1) { $flickable.flickable('scrollPrev'); }
						}
					})
					//manual trigger to scroll to last viewed day
					$($btnTabs[App.view.lastViewedDay-1]).trigger('click');
				})();
				//apply max height for tabs container (Android only)
				if ($.os.android) {
					(function(){
						var $flickable = $('.flickableContainer'),
							$dayTabM = $('#m'),
							$dayTabT = $('#t'),
							$dayTabW = $('#w'),
							newHeightM = $dayTabM.find('.scroller').height(),
							newHeightT = $dayTabT.find('.scroller').height(),
							newHeightW = $dayTabW.find('.scroller').height(),
							numbers_array = [newHeightM, newHeightT, newHeightW],
							biggestHeight = Math.max.apply( null, numbers_array );
						console.log('biggestHeight: '+ biggestHeight);
						$page.find('.pageContent').css('height',biggestHeight);
					})();
				}
			}
			//bio
			else if ( pageID == 'pgBio' ) {
				App.view.branch = App.utils.getBranchFromHash();
				//scroll page to top (Android only)
				if ($.os.android) { document.body.scrollTop = 0; }
			}
			//session pages
			else if ( pageID == 'pgSession' ) {
				//initCtrlToggle
				App.view.initCtrlToggle();
				//handle back btn
				var $btnBack = $page.find('#btnBack'),
					href = $btnBack.attr('href'),
					startIdx = href.indexOf('#'),
					endIdx = href.indexOf('?'),
					hrefBranch = href.substr(startIdx, endIdx-startIdx);
				if ( App.view.branch.length <= 0 || hrefBranch == App.view.branch) return;
				href = href.replace(hrefBranch, App.view.branch);
				$btnBack.attr('href', href);
				console.log('Update btnBack URL to: ' + href);
				//scroll page to top (Android only)
				if ($.os.android) { document.body.scrollTop = 0; }
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
