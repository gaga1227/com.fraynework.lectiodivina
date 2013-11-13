/* ------------------------------------------------------------------------------ */
/* App - data */
/* ------------------------------------------------------------------------------ */
window.App = (function(app){

	//create empty App obj if none found
	var App = app || {};

	/* ------------------------------------------------------------------------------ */
	/* data */
	App.data = {
		
		/* ------------------------------------------------------------------------------ */
		/* data */
		
		//articles count
		articles: [ 4, 4, 4, 4, 8 ],
		
		/* ------------------------------------------------------------------------------ */
		/* ajax */
		
		//getPage
		getPage: function(targetURL, dir){
			//vars
			var thisObj = this,										//ref to data obj
				request,											//request status
				url = targetURL;									//request url

			//abort if no url or in request already
			if (!url || this.inRequest) return false;

			//otherwise set in request status and show loader
			this.inRequest = true;

			//show loader
			App.view.toggleLoader(true);

			//make request call
			request = $.ajax({
				url:		url,
				type:		'GET',
				dataType:	'html',
				success:	function(data, textStatus, jqXHR) {
								//alert('getPage: success');
								console.log('getPage: success');
								console.log('[DIR]:', dir);
								//check data
								if (data.length < 2) {
									thisObj.inRequest = false;
									thisObj.getPage('home.html', 'left');
									return;
								}
								App.view.slider.slidePageFrom( $(data), dir );
							},
				complete:	function(jqXHR, textStatus) {
								//alert('getPage: complete');
								console.log('getPage: complete');
								thisObj.inRequest = false;
								//hide loader
								App.view.toggleLoader(false);
							},
				error:		function(jqXHR, textStatus, errorThrown) {
								//alert('getPage: error', textStatus, errorThrown);
								console.log('getPage: error', textStatus, errorThrown);
								//fallback for invalid url
								thisObj.inRequest = false;
								thisObj.getPage('home.html', 'left');
							}
			});
		},
		
		//getArticle
		getArticle: function(seg, $conatiner, targetURL, effect){
			//vars
			var thisObj = this,										//ref to data obj
				request,											//request status
				url = targetURL,									//request url
				slider = App.view.articleSlider;					//slider
				
			//abort if no url or in request already
			if (!$conatiner.length || !url || this.inArticleRequest) return false;
			
			//otherwise set in request status and show loader
			this.inArticleRequest = true;

			//show loader
			App.view.toggleLoader(true);
			
			//make request call
			request = $.ajax({
				url:		url,
				type:		'GET',
				dataType:	'html',
				success:	function(data, textStatus, jqXHR) {
								//alert('getArticle: success');
								console.log('getArticle: success');
								console.log('[EFFECT]:', effect);
								//check data
								if (data.length < 2) {
									thisObj.inArticleRequest = false;
									thisObj.getArticle(seg, $conatiner, 'data/article-error.html', 'in');
									return;
								}
								slider.slideArticle(seg, $conatiner, $(data), effect);
							},
				complete:	function(jqXHR, textStatus) {
								//alert('getArticle: complete');
								console.log('getArticle: complete');
								thisObj.inArticleRequest = false;
								//hide loader
								App.view.toggleLoader(false);
							},
				error:		function(jqXHR, textStatus, errorThrown) {
								//alert('getArticle: error', textStatus, errorThrown);
								console.log('getArticle: error', textStatus, errorThrown);
								//fallback for invalid url
								thisObj.inArticleRequest = false;
								thisObj.getArticle(seg, $conatiner, 'data/article-error.html', 'in');
							}
			});
		},

		/* ------------------------------------------------------------------------------ */
		//init
		init: function() {
			//alert('app.data.init()');
		}

	}

	return App;

})(window.App);
