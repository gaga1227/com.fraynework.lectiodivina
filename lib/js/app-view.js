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

		//touch delay
		touchDelay: 100,
	
		//sliders
		slider: 		new PageSlider( $('#container') ),
		articleSlider: 	new ArticleSlider(),
		
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
			//if ($.os.ios) { return 'iOS uses native scrolling'; }
			//destroy plugin scroller
			if (Scroller) Scroller.destroy();
			//init scrolling plugin
			if (typeof(IScroll) == 'function') {
				Scroller = new IScroll($container[0], {
					scrollbars: 			true,
					lockDirection: 			true,
					updateOnChanges: 		true
				});
			} else if (typeof(FTScroller) == 'function') {
				Scroller = new FTScroller($container[0], {
					scrollingX: 			false,
					scrollbars: 			true,
					updateOnChanges: 		true,
					bouncing:				true
				});	
			}
		},

		//initPageSlider
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
					scrollbars:		false,
					bouncing:		false,
					flinging:		false,
					scrollBoundary: 120,
					scrollResponseBoundary:120
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
		
		//loadWeekArticle
		loadWeekArticle: function(seg, index, effect){
			//normalise invalid index to default
			if (!index || index <= 0 ) { index = 1; }
			if (!effect) { effect = 'in'; }
			
			//vars
			var url = 'data/article-' + (seg+1) + '-' + index + '.html',
				$page = $('#pgWeeks'),
				$container = $page.find('#weekContainer' + (seg+1));
								
			//get article
			console.log('[loadWeekArticle]', 'seg:'+seg, 'index:'+index, url);
			App.data.getArticle(seg, $container, url, effect);						
		},
		
		//initPageNavigator
		initPageNavigator: function( $page ){			
			//vars
			var $pageNav = $('#articleNav'),
				$btnNavs = $pageNav.find('.navItem');				
				
			//handler
			function onBtnNav($btn){
				//vars
				var seg = App.view.weeksScroller.currentSegment.x,
					segLength = App.data.articles[seg],
					$container = $('#weekContainer' + (seg+1)),
					$article = $container.find('[data-role="article"]'),
					currentIndex = parseInt($article.attr('data-index'), 10),
					isEnd = ($article.attr('data-end') == 1) ? true : false;
					isForward = ($btn.attr('data-forward') == 1) ? true : false,
					targetIndex = isForward ? Math.min(segLength, currentIndex + 1) : Math.max(1, currentIndex - 1);
					effect = isForward ? 'in' : 'out';
				
				//exit if no change on article index
				if (currentIndex == targetIndex) return 'no article change';
				
				//load article
				console.log('[onBtnNav]', seg, targetIndex);
				App.view.loadWeekArticle(seg, targetIndex, effect);
			}
			
			//bind interaction
			$.each($btnNavs, function(idx,ele){
				var $btn = $(this);
				$btn.on('click', function(e){ 
					e.preventDefault();
				});
				$btn.on('tap', function(e){
					e.preventDefault();
					onBtnNav($btn);
				});
			});			
		},
		
		//initBtnWeek
		initBtnWeek: function(){
			//handler
			function onBtnWeek($btn){
				//vars
				var $btnTabs = $('#nav').find('.navItem'),
					week = $btn.attr('data-target-week'),
					currentWeek = parseInt(App.view.weeksScroller.currentSegment.x, 10) + 1,
				//validate seg
				seg	= Math.min(seg, App.data.articles.length);
				seg	= Math.max(seg, 1);
				
				//exit if no change on week index
				if (currentWeek == week) return 'no week change';
				
				//call week scroller
				console.log('[onBtnWeek]', week);
				$($btnTabs[week-1]).trigger('tap');
			}
			
			//bind interaction
			$(document).on('click', '.btnWeek', function(e) {
				e.preventDefault();
			});	
			$(document).on('tap', '.btnWeek', function(e) {
				e.preventDefault();
				onBtnWeek($(this));
			});		
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
						//vars
						var currentSeg = Scroller.currentSegment.x,
							$currentTab = $($btnTabs[currentSeg]);
						//update nav tabs
						$currentTab.addClass(currentCLS);
						$currentTab.siblings('.navItem').removeClass(currentCLS);
						//load article
						App.view.loadWeekArticle(currentSeg);
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
						console.log('[weeksScroller]', 'seg:' + tgtIdx, 'offset:' + offsetLeft);						
						//update tabs
						$this.addClass(currentCLS);
						$this.siblings('.navItem').removeClass(currentCLS);
					})
					//ignore click events
					$btnTabs.off('click');
					$btnTabs.on('click', function(e){ e.preventDefault(); });
					//manual trigger to start with first tab
					$($btnTabs[0]).trigger('tap');
					//load article for first tab
					App.view.loadWeekArticle(0);
				})();
				
				//init nav buttons
				this.initPageNavigator($page);
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
		
		//initArticle
		initArticle: function( $article ){
			console.log( 'article load: ' );
		},
		
		//initArticleShown
		initArticleShown: function( $article ){
			console.log( 'article shown: ' );
			
			//init article scroller
			var	$container = $article.find('[data-role=scroller]');
			if (!$container.length) { return 'no scroller container found'; }
			//destroy plugin scroller
			if (Scroller) Scroller.destroy();
			//init scrolling plugin
			if (typeof(IScroll) == 'function') {
				console.log('s');
				Scroller = new IScroll($container[0], {
					scrollbars: 			true,
					lockDirection: 			true,
					updateOnChanges: 		true
				});
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
			this.initPageSlider();
			this.initBtnWeek();
		}

	};

	return App;

})(window.App);
