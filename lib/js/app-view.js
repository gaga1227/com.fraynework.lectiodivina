/* ------------------------------------------------------------------------------ */
/* App - view */
/* ------------------------------------------------------------------------------ */
window.App = (function(app){

	//create empty App obj if none found
	var App = app || {};

	/* ------------------------------------------------------------------------------ */
	/* view */
	App.view = {

		/* ------------------------------------------------------------------------------ */
		/* properties */
		
		//branch
		branch: '',

		//touch delay
		touchDelay: 100,
	
		//sliders
		slider: 			new PageSlider( $('#container') ),
		articleSlider: 		new ArticleSlider(),
		
		//scrollers
		Scroller:			undefined,
		articleScroller:	undefined,
		weeksScroller:		undefined,
		
		//scrollersStatus
		scrollersStatus: {
			weeksScroller: 	false
		},
		
		//selectors
		selectors:	{
			btnNavWeek:		'.navItem.btnWeek',
			btnNavExtra:	'.navItem.btnExtra',
			btnNavArticle:	'.navItem.btnArticle'
		},
		
		/* ------------------------------------------------------------------------------ */
		/* common */
		
		//initButtonsEvents
		initButtonsEvents: function() {
			var $doc = $(document);
			//common
			$doc.on('touchstart', '[data-role="button"]', function(e) {
					console.log('------------------------------------------------');
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
		
		//toggleLoader
		toggleLoader: function(showflag) {
			var $loader = $('#loader'),
				activeCls = 'active';
			if (!$loader.length) return 'no loader elem found';
			showflag ? $loader.addClass(activeCls) : $loader.removeClass(activeCls);
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

		/* ------------------------------------------------------------------------------ */
		/* scroller */
		
		//initScroller (requires FTScroll/iScroll)
		initScroller: function(){
			var	$container = $('[data-role=scroller]'),
				container;
			if (!$container.length) { return 'no scroller container found'; }
			//assign container, in case multiple instances
			container = ($container.length > 1) ? $container[1] : $container[0];
			//destroy scroller instance
			if (App.view.Scroller) {
				App.view.Scroller.destroy();
			}						
			//init scrolling plugin
			if (typeof(IScroll) == 'function') {
				App.view.Scroller = new IScroll(container, {
					scrollbars: 			true
				});
			} else if (typeof(FTScroller) == 'function') {
				App.view.Scroller = new FTScroller(container, {
					scrollingX: 			false,
					scrollbars: 			true,
					updateOnChanges: 		true,
					updateOnWindowResize: 	true,
					bouncing:				true
				});	
			}
		},

		//initArticleScroller
		initArticleScroller: function( $article ){
			var	$container = $article.find('[data-role=scroller]');
			if (!$container.length) { return 'no article scroller container found'; }
			//destroy scroller instance
			if (this.articleScroller) this.articleScroller.destroy();
			//init scrolling plugin
			if (typeof(IScroll) == 'function') {
				this.articleScroller = new IScroll($container[0], {
					scrollbars: 			true
				});
			}
		},
		
		/* ------------------------------------------------------------------------------ */
		/* custom - home */
				
		//initHomeIntro
		initHomeIntro: function( $page ){
			$page.find('.nav, .navExtra, .intro').addClass('active');
		},
		
		/* ------------------------------------------------------------------------------ */
		/* custom - weeks */
		
		//initWeeksScroller
		initWeeksScroller: function($tgt, $seg, custOpts){
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
					scrollingY:				false,
					snapping: 				true,
					paginatedSnap:			true,
					scrollbars:				false,
					bouncing:				false,
					flinging:				false,
					updateOnWindowResize: 	true,
					updateOnChanges: 		true,
					scrollBoundary: 		150,
					scrollResponseBoundary:	150,
				}, custOpts );
			
			//update dimension
			$tgt.find('[data-role="wrapper"]').width( Math.ceil(segW * segNum) );
			$seg.width( segW );
			$seg.height( segH );
			
			//init weeksScroller
			if (App.view.weeksScroller) { App.view.weeksScroller.destroy(); }
			App.view.weeksScroller = new FTScroller($tgt[0], opts); 
			
			//weeksScroller events
			App.view.weeksScroller.addEventListener('segmentdidchange', App.view.onSegmentdidchange);
			App.view.weeksScroller.addEventListener('scrollstart', function(e){ App.view.scrollersStatus.weeksScroller = true });
			App.view.weeksScroller.addEventListener('scrollend',   function(e){ App.view.scrollersStatus.weeksScroller = false });
		},
		
		//onSegmentdidchange
		onSegmentdidchange: function(e){
			//vars
			var $btnTabs = $('#nav').find(App.view.selectors.btnNavWeek),
				currentSeg = App.view.weeksScroller.currentSegment.x,
				$currentTab = $($btnTabs[currentSeg]),
				currentCLS = 'current';
			//update nav tabs (for swipe only)
			$currentTab.addClass(currentCLS);
			$currentTab.siblings(App.view.selectors.btnNavWeek).removeClass(currentCLS);
			
			/***************************************************************
			//insert logic of showing week intro
			****************************************************************/
			
			//load article
			App.view.loadWeekArticle(currentSeg);
		},
		
		//initWeeksNavTabs
		initWeeksNavTabs: function(){
			//vars
			var $navTabs = $('#nav'),
				$btnTabs = $navTabs.find(App.view.selectors.btnNavWeek),
				currentCLS = 'current',
				params = App.utils.getVarsFromSearch();
			//clean up residue class
			$btnTabs.removeClass(currentCLS);
			//ignore click events
			$btnTabs.off('click');
			$btnTabs.on('click', function(e){ e.preventDefault(); });
			//bind tab btn handler
			$btnTabs.off('tap');
			$btnTabs.on('tap', function(e){
				e.preventDefault();
				//exit if weeksScroller still running
				if ( App.view.scrollersStatus.weeksScroller ) { return 'weeksScroller still running'; }
				//exit if click on current btn
				if ( $(this).hasClass(currentCLS) ) { return 'target week already current'; }
				//vars
				var $this = $(this),
					$btnTabCurrent = $navTabs.find('.' + currentCLS),
					currentIdx = $btnTabCurrent.index(),
					tgtIdx = $this.index(),
					offsetLeft = tgtIdx * $(document).width();
				//trigger scrolling
				App.view.weeksScroller.scrollTo(offsetLeft, 0, true);
				console.log('[weeksScroller]:', 'seg ' + tgtIdx, 'offset ' + offsetLeft);						
				//update tabs
				$this.addClass(currentCLS);
				$this.siblings(App.view.selectors.btnNavWeek).removeClass(currentCLS);
			})
			//manual trigger to start with first tab			
			$($btnTabs[ parseInt(params.week, 10) - 1 ]).trigger('tap');
			//load article for first tab
			if (params.week == 1) App.view.onSegmentdidchange();
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
			console.log('[loadWeekArticle]:', 'seg '+seg, 'index '+index, 'url '+url);
			App.data.getArticle(seg, $container, url, effect);						
		},
		
		//initArticleNavigator
		initArticleNavigator: function( $page ){			
			//vars
			var $articleNav = $('#articleNav'),
				$btnNavs = $articleNav.find(App.view.selectors.btnNavArticle);				
				
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
				console.log('[onBtnNav]:', seg, targetIndex);
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
		
		//initBtnJumpWeek
		initBtnJumpWeek: function(){
			//handler
			function onBtnJumpWeek($btn){
				//vars
				var $btnTabs = $('#nav').find(App.view.selectors.btnNavWeek),
					week = $btn.attr('data-target-week'),
					currentWeek = parseInt(App.view.weeksScroller.currentSegment.x, 10) + 1,
				//validate seg
				seg = Math.min(seg, App.data.articles.length);
				seg = Math.max(seg, 1);
				
				//exit if no change on week index
				if (currentWeek == week) return 'no week change';
				
				//call week scroller
				console.log('[onBtnJumpWeek];', week);
				$($btnTabs[week-1]).trigger('tap');
			}
			
			//bind interaction
			$(document).on('click', '.btnJumpWeek', function(e) {
				e.preventDefault();
			});        
			$(document).on('tap', '.btnJumpWeek', function(e) {
				e.preventDefault();
				onBtnJumpWeek($(this));
			});                
		},
		
		/* ------------------------------------------------------------------------------ */
		/* page */

		//initPage
		initPage: function( $page ){
			var pageID = $page.attr('id');
			console.log( '[page load]: ' + pageID );
			
			//home
			if ( pageID == 'pgHome' ) {
				//update global nav style
				$('#nav').addClass('hidden');
				//trigger home intro
				setTimeout(App.view.initHomeIntro, 100, $page);
			}
			
			//weeks
			else if ( pageID == 'pgWeeks' ) {
				//update global nav style
				$('#nav').removeClass('hidden extra');
				$('#nav').addClass('week');
				//update branch
				App.view.branch = '#weeks';
				//initWeeksScroller
				this.initWeeksScroller($page.find('.sectionScroller'), $page.find('[data-role="section"]'), {});
				//initWeeksNavTabs
				this.initWeeksNavTabs();
				//init nav buttons
				this.initArticleNavigator($page);
			}
			
			//all others
			else {
				//update global nav style
				$('#nav').removeClass('hidden week');
				$('#nav').addClass('extra');
				//update branch
				App.view.branch = App.utils.getBranchFromHash();
			}
		},

		//initPageShown
		initPageShown: function( $page ){
			var pageID = $page.attr('id'),
				hasScroller = ($page.attr('data-scroller') == '1') ? true : false;
			console.log( '[page shown]: ' + pageID + (hasScroller ? ' (has scroller)' : '') );
			
			//common
			if ( hasScroller ){ 
				App.view.initScroller();
				//setTimeout(function(){ App.view.initScroller(); }, 150);
			}
			
			//home
			if ( pageID == 'pgHome' ) {
				//trigger home intro
				App.view.initHomeIntro($page);
			}
		},
		
		/* ------------------------------------------------------------------------------ */
		/* article */

		//initArticle
		initArticle: function( $article ){
			var week = $article.attr('data-week'),
				index = $article.attr('data-index');
			console.log( '[article load]: week ' + week + ', index ' + index );
		},
		
		//initArticleShown
		initArticleShown: function( $article ){
			var week = $article.attr('data-week'),
				index = $article.attr('data-index');
			console.log( '[article shown]: week ' + week + ', index ' + index );
			//initArticleScroller
			this.initArticleScroller($article);
		},

		/* ------------------------------------------------------------------------------ */
		/* init */
		init: function(){
			//alert('app.view.init()');
			this.initButtonsEvents();
			this.initPageSlider();
			this.initBtnJumpWeek();
			this.initExternalLinks();
		}

	};

	return App;

})(window.App);
