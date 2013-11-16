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
		
		//transitionStatus
		transitionStatus: {
			weeksScroller: 	false,
			pageSlider:		false,
			articleSlider:	false
		},
		
		//mediaStatus
		mediaStatus: {
			playing: 		false,
			status:			0
		},
		
		//AudioPlayer
		AudioPlayer:		undefined,
		
		//selectors
		selectors:	{
			btnNavWeek:		'.navItem.btnWeek',
			btnNavWeekNav:	'.navItem.btnWeekNav',
			btnNavExtra:	'.navItem.btnExtra',
			btnNavArticle:	'.navItem.btnArticle',
			btnNavAudio:	'.navItem.btnAudio'
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
					scrollbars: 			true,
					click: 					Platform.iOS ? false : true
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
					bouncing:				true,
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
			App.view.weeksScroller.addEventListener('segmentwillchange', App.view.onSegmentwillchange);
			App.view.weeksScroller.addEventListener('segmentdidchange', App.view.onSegmentdidchange);
			App.view.weeksScroller.addEventListener('scrollstart', function(e){ App.view.transitionStatus.weeksScroller = true });
			App.view.weeksScroller.addEventListener('scrollend',   function(e){ App.view.transitionStatus.weeksScroller = false });
		},
		
		//onSegmentwillchange 
		onSegmentwillchange: function(e){
			
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
			//update article template layout 
			App.view.updateArticleType(true);
			//load article
			App.view.loadWeekArticle(currentSeg);
		},
		
		//initWeeksNavTabs
		initWeeksNavTabs: function(){
			//vars
			var $nav = $('#nav'),
				$btnTabs = $nav.find(App.view.selectors.btnNavWeek),
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
				if ( App.view.transitionStatus.weeksScroller ) { return 'weeksScroller still running'; }
				//exit if click on current btn
				if ( $(this).hasClass(currentCLS) ) { return 'target week already current'; }
				//vars
				var $this = $(this),
					$btnTabCurrent = $nav.find('.' + currentCLS),
					currentIdx = $btnTabs.index($btnTabCurrent),
					tgtIdx = $btnTabs.index($this),
					offsetLeft = tgtIdx * $(document).width();
				//trigger scrolling
				App.view.weeksScroller.scrollTo(offsetLeft, 0, true);
				console.log('[weeksScroller]:', 'seg ' + tgtIdx, 'offset ' + offsetLeft);						
				//update tabs status
				$this.addClass(currentCLS);
				$this.siblings(App.view.selectors.btnNavWeek).removeClass(currentCLS);
				//updateArticleType to landing upon scroll
				App.view.updateArticleType(true);
			})
			//manual trigger to start with first tab			
			$($btnTabs[ parseInt(params.week, 10) - 1 ]).trigger('tap');
			//load article for first tab
			if (params.week == 1) App.view.onSegmentdidchange();
		},
		
		//initWeeksNavBtns
		initWeeksNavBtns: function(){
			//vars
			var $nav = $('#nav'),
				$btnNavs = $nav.find(App.view.selectors.btnNavWeekNav),
				$btnNavPrev = $($btnNavs[0]),
				$btnNavNext = $($btnNavs[1]),
				disabledCLS = 'disabled',
				disabledFeedbackCLS = 'shake',
				segCount = App.view.weeksScroller.segmentCount.x;
			//clean up residue class
			//$btnNavs.removeClass(disabledCLS);
			//ignore click events
			$btnNavs.off('click');
			$btnNavs.on('click', function(e){ e.preventDefault(); });
			//bind tab btn handler
			$btnNavs.off('tap');
			$btnNavs.on('tap', function(e){
				e.preventDefault();
				//exit if weeksScroller still running
				if ( App.view.transitionStatus.weeksScroller ) { return 'weeksScroller still running'; }
				//exit if disabled
				//if ( $(this).hasClass(disabledCLS) ) { return 'button disabled'; }
				//vars
				var $this = $(this),
					isForward = ($this.attr('data-forward') == '1') ? true : false,
					offsetLeftBy = $(document).width() * (isForward ? 1 : -1),
					currentSeg = App.view.weeksScroller.currentSegment.x;
				//handle first/last no scroll feedback
				if ( (currentSeg == 0 && !isForward) || (currentSeg == segCount-1 && isForward) ) { 
					App.utils.attachCSSAnim($('.sectionWrapper'), disabledFeedbackCLS);
					console.log('[weeksScroller]:', isForward ? 'forward' : 'backward', 'segment ' + (currentSeg+1) + '/' + segCount, 'no scroll');
					return 'first/last no scroll';
				}
				//trigger scrolling
				App.view.weeksScroller.scrollBy(offsetLeftBy, 0, true);
				//updateArticleType to landing upon scroll
				App.view.updateArticleType(true);
				console.log('[weeksScroller]:', isForward ? 'forward' : 'backward', 'segment ' + (currentSeg+1) + '/' + segCount);
			})
		},
		
		//initBtnJumpWeek
		initBtnJumpWeek: function(){
			//handler
			function onJumpWeek($btn){
				//vars
				var $btnTabs = $('#nav').find(App.view.selectors.btnNavWeek),
					week = $btn.attr('data-target-week'),
					currentWeek = parseInt(App.view.weeksScroller.currentSegment.x, 10) + 1;
				
				//validate seg
				/*
				seg = Math.min(seg, App.data.articles.length);
				seg = Math.max(seg, 1);
				*/
				
				//exit if no change on week index
				if (currentWeek == week) return 'no week change';
				
				//call week scroller
				console.log('[onJumpWeek];', week);
				$($btnTabs[week-1]).trigger('tap');
			}
			
			//bind interaction
			$(document).on('click', '.btnJumpWeek', function(e) {
				e.preventDefault();
			});        
			$(document).on('tap', '.btnJumpWeek', function(e) {
				e.preventDefault();
				onJumpWeek($(this));
			});                
		},
		
		/* ------------------------------------------------------------------------------ */
		/* custom - article */
		
		//loadWeekArticle
		loadWeekArticle: function(seg, index, effect){
			//normalise invalid index to default
			if (index == undefined || index < 0 ) { index = 0; }
			if (!effect) { effect = 'in'; }
			
			//vars
			var url = 'data/article-' + (seg+1) + '-' + index + '.html',
				$page = $('#pgWeeks'),
				$container = $page.find('#weekContainer' + (seg+1));
								
			//get article
			console.log('[loadWeekArticle]:', 'seg '+(seg+1), 'index '+index, 'url '+url);
			App.data.getArticle(seg, $container, url, effect);					
		},
		
		//updateArticleType
		updateArticleType: function(isLanding){
			//vars
			var $container = $('#pgWeeks');
			//exit
			if (!$container.length) return false;
			//update type flag
			console.log('[updateArticleType]: to', isLanding ? 'landing' : 'normal');
			//android doesn't update css with data-attributes, must use class
			$container.attr('data-landing', isLanding ? 1 : 0);
			isLanding ? $container.addClass('landing') : $container.removeClass('landing');
		},
		
		//initArticleNavigator
		initArticleNavigator: function( $page ){			
			//vars
			var $articleNav = $('#articleNav'),
				$btnNavs = $articleNav.find(App.view.selectors.btnNavArticle);				
				
			//handler
			function onBtnNav($btn){
				//exit if article slider running
				if ( App.view.transitionStatus.articleSlider ) { return 'article slider still running'; }
				
				//vars
				var seg = App.view.weeksScroller.currentSegment.x,
					segLength = App.data.articles[seg],
					$container = $('#weekContainer' + (seg+1)),
					$article = $container.find('[data-role="article"]'),
					currentIndex = parseInt($article.attr('data-index'), 10),
					isLanding = (currentIndex == 0) ? true : false,
					isStart = (currentIndex == 1) ? true : false,
					isEnd = ($article.attr('data-end') == 1) ? true : false,
					isForward = ($btn.attr('data-forward') == 1) ? true : false,
					targetIndex = isForward ? Math.min(segLength, currentIndex + 1) : Math.max(1, currentIndex - 1),
					effect = isForward ? 'in' : 'out',
					disabledFeedbackCLS = 'shake';
				
				//exit if 
				//no change on article index
				if (currentIndex == targetIndex) {
					console.log('[onBtnNav]:', 'week ' + (seg+1), 'index ' + targetIndex + 'no article change');
					App.utils.attachCSSAnim($container, disabledFeedbackCLS);
					return 'no article change';
				}
				//going backward on landing page
				if (isLanding && !isForward) {
					console.log('[onBtnNav]:', 'week ' + (seg+1), 'index ' + targetIndex + 'landing article, no backward');
					App.utils.attachCSSAnim($container, disabledFeedbackCLS);
					return 'landing article, no backward';
				}
				//going forward on last page
				if (isEnd && isForward) {
					console.log('[onBtnNav]:', 'week ' + (seg+1), 'index ' + targetIndex + 'last article, no forward');
					App.utils.attachCSSAnim($container, disabledFeedbackCLS);
					return 'last article, no forward';
				}
				
				//load article
				console.log('[onBtnNav]:', 'week ' + (seg+1), 'index ' + targetIndex);
				App.view.loadWeekArticle(seg, targetIndex, effect);
				
				//updateArticleType
				if (isStart && !isForward) {
					App.view.updateArticleType(true);
				}
				else if (isLanding && isForward) {
					App.view.updateArticleType(false);
				}
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
		
		//initBtnJumpArticle
		initBtnJumpArticle: function(){			
			//handlers
			function onJumpStraightToArticle($btn){
				//vars
				var targetIndex = parseInt($btn.attr('data-target-article'),10),
					seg = App.view.weeksScroller.currentSegment.x,
					typeIsLanding = (targetIndex == 0) ? true : false;
				
				//update article template layout
				App.view.updateArticleType(typeIsLanding);
				
				//load article
				console.log('[onJumpStraightToArticle]: index:', targetIndex);
				App.view.loadWeekArticle(seg, targetIndex);
			}
			function onJumpArticle($btn){
				//vars
				var isForward = ($btn.attr('data-forward') == '0') ? false : true,
					$btnNav = isForward ? $('#articleNext') : $('#articlePrev');
				
				//delegate to ArticleNavigator btnArticle
				console.log('[onJumpArticle]: forward:', isForward);
				$btnNav.trigger('tap');
			}
			
			//bind interaction
			$(document).on('click', '.btnJumpArticle', function(e) {
				e.preventDefault();
			});        
			$(document).on('tap', '.btnJumpArticle', function(e) {
				e.preventDefault();
				//vars
				var $btn = $(this),
					isJumpStraightToArticle = ( parseInt($btn.attr('data-target-article'),10) >= 0 ) ? true : false;
				//choose handlers depending on jump type
				isJumpStraightToArticle ? onJumpStraightToArticle($btn) : onJumpArticle($btn);
			});                
		},
		
		/* -------------------------------------------------------------------------- */
		/* custom - article audio */
		
		/* updateBtnAudioStatus */
		updateBtnAudioStatus: function(statusCls){
			//vars
			var $btnAudio = $('#articleAudio'),
				allCls = 'running stopped disabled';
			//exit
			if (!statusCls || !$btnAudio.length) return false;
			//update
			$btnAudio
				.removeClass(allCls)
				.addClass(statusCls);			
		},
		
		/* killAudio */
		killAudio: function(deadly){
			//vars
			var $btnAudio = $('#articleAudio'),
				isDisabled = $btnAudio.hasClass('disabled');
			
			//exit
			if (isDisabled) return 'no audio, disabled';
			
			//update ui
			App.view.updateBtnAudioStatus(deadly ? 'disabled' : 'stopped');
			
			//reset/pause player
			if (App.view.AudioPlayer) {
				if (deadly) {
					//App.view.AudioPlayer.stop(); //no need to stop before release
					App.view.AudioPlayer.release();
					App.view.AudioPlayer = undefined;
				} else {
					App.view.AudioPlayer.pause();
				}
			}
			console.log('[killAudio]: ', deadly ? 'deadly' : 'softly');
		},
		
		//onMediaError
		onMediaError: function(code){
			//kill audio
			App.view.killAudio();
		},
		
		//onMediaStatus
		onMediaStatus: function(status){
			//exit
			if (status < 0) return 'status code invalid';
			//update
			App.view.mediaStatus.status = status;
			//starting/running
			if (status == 1 || status == 2) {
				console.log('[onMediaStatus]: Media ' + (status == 1 ? 'Starting' : 'Running'));
				App.view.mediaStatus.playing = true;
				App.view.updateBtnAudioStatus('running');
			} else {
				App.view.mediaStatus.playing = false;
				//None media
				if (status == 0) {
					console.log('[onMediaStatus]: No Media');
					App.view.updateBtnAudioStatus('disabled');
				}
				//paused
				if (status == 3) {
					console.log('[onMediaStatus]: Media Paused');
					App.view.updateBtnAudioStatus('stopped');
				}
				//stopped
				if (status == 4) { 
					console.log('[onMediaStatus]: Media Stopped');
					App.view.updateBtnAudioStatus('stopped');
					if (App.view.AudioPlayer) {
						App.view.AudioPlayer.release();
						App.view.AudioPlayer = undefined;
					}
				}
			}
		},
		
		/* initArticleAudio */
		initArticleAudio: function($article){
			//vars
			var $btnAudio = $('#articleAudio'),
				week = parseInt($article.attr('data-week'),10),
				index = parseInt($article.attr('data-index'),10),
				hasAudio = ($article.attr('data-audio') == '1') ? true : false,
				url = App.data.audioURL.replace('{w}', week).replace('{i}', index);
			
			//update ui state 
			if (hasAudio) { App.view.updateBtnAudioStatus('stopped'); }
			
			//handlers
			function onBtnAudio(e){
				//vars
				var $btn = $(this),
					isPlaying = App.view.mediaStatus.playing,
					isPaused = App.view.mediaStatus.status == 3 ? true : false,
					action = isPlaying ? 'pause' : 'play';
				
				//exit
				if (!hasAudio || $btn.hasClass('disabled')) {
					console.log('[onBtnAudio]: error or no audio for this article');
					return 'error or no audio for this article';
				}
				
				//apply action
				console.log('[onBtnAudio]: ', 'url ' + url, 'action ' + action);
				if (action == 'play') {
					if (isPaused) {
						//play
						App.view.AudioPlayer.play();
					} else {
						//load audio and play
						App.view.AudioPlayer = App.utils.loadMedia(url, true);	
					}
				} else {
					if (App.view.AudioPlayer) {
						App.view.AudioPlayer.pause();
					}
				}
			}
			
			//ignore click events
			$btnAudio.off('click');
			$btnAudio.on('click', function(e){ e.preventDefault(); });
			//bind tab btn handler
			$btnAudio.off('tap');
			$btnAudio.on('tap', onBtnAudio);
		},
		
		/* ------------------------------------------------------------------------------ */
		/* custom - extra */
		
		//updateExtraPagesStatus
		updateExtraPagesStatus: function(){
			//vars
			var $btnTabs = $('#nav').find(App.view.selectors.btnNavExtra),
				$currentTab,
				currentCLS = 'current',
				activeCLS = 'active';
			//loop through all buttons find the current one
			$.each($btnTabs, function(idx, ele){
				var $btn = $(this),
					href = $btn.attr('href');
				//update to current if href matches branch
				if ( href.indexOf(App.view.branch) >= 0 ) {
					$currentTab = $btn;
					return false;
				}
			});
			//update nav tabs
			$btnTabs.removeClass(activeCLS);
			$currentTab.addClass(currentCLS);
			$currentTab.siblings(App.view.selectors.btnNavExtra).removeClass(currentCLS);
		},		
		
		/* ------------------------------------------------------------------------------ */
		/* page */

		//initPage
		initPage: function( $page ){
			//vars
			var pageID = $page.attr('id'),
				isFullscreen = ($page.attr('data-fullscreen') == '1') ? true : false;
			console.log( '[page load]: ' + pageID );
			
			//common
			if ( isFullscreen ){ 
				$('#container').addClass('fullscreen');
			} else {
				$('#container').removeClass('fullscreen');	
			}			
			
			//killAudio
			App.view.killAudio(true);
			
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
				App.view.initWeeksScroller($page.find('.sectionScroller'), $page.find('[data-role="section"]'), {});
				//initWeeksNavTabs
				App.view.initWeeksNavTabs();
				//initWeeksNavBtns
				App.view.initWeeksNavBtns();
				//init nav buttons
				App.view.initArticleNavigator($page);
			}
			
			//extra
			else {
				//update global nav style
				$('#nav').removeClass('hidden week');
				$('#nav').addClass('extra');
				//update branch
				App.view.branch = App.utils.getBranchFromHash();
				//updateExtraPagesStatus
				App.view.updateExtraPagesStatus();
			}
		},

		//initPageShown
		initPageShown: function( $page ){
			//vars
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
			//vars
			var week = $article.attr('data-week'),
				index = $article.attr('data-index');
			console.log( '[article load]: week ' + week + ', index ' + index );
			
			//common
			
			//killAudio
			App.view.killAudio(true);
		},
		
		//initArticleShown
		initArticleShown: function( $article ){
			//vars
			var week = $article.attr('data-week'),
				index = $article.attr('data-index');
			console.log( '[article shown]: week ' + week + ', index ' + index );
			//initArticleScroller
			this.initArticleScroller($article);
			//initArticleAudio
			this.initArticleAudio($article);
		},

		/* ------------------------------------------------------------------------------ */
		/* init */
		init: function(){
			//alert('app.view.init()');
			this.initButtonsEvents();
			this.initPageSlider();
			this.initBtnJumpArticle();
			this.initBtnJumpWeek();
			this.initExternalLinks();
		}

	};

	return App;

})(window.App);
