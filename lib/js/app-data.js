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
		//function - getPage
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
								if (data.length < 10) {
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

		/* ------------------------------------------------------------------------------ */
		//function - init data obj
		init: function() {
			//alert('app.data.init()');
		}

	}

	return App;

})(window.App);
