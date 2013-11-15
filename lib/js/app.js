/* ------------------------------------------------------------------------------ */
/* App */
/* ------------------------------------------------------------------------------ */
window.App = (function(app){

	//create empty App obj if none found
	App = app || {};
	
	/* ------------------------------------------------------------------------------ */
	/* properties */	
	App.name = 			'Lectio Divina 2013';
	App.version = 		'1.0.0';
	App.lastUpdate = 	'2013-11';

	/* ------------------------------------------------------------------------------ */
	/* handlers */
	
	//onDeviceReady
	App.onDeviceReady = function(e) {
		//alert('e:deviceready');
		console.log('e:deviceready');
	};

	//onResume
	App.onResume = function(e) {
		//alert('e:resume');
		console.log('e:resume');

		//reloadApp
		//App.utils.reloadApp();
	};
	
	//onBackbutton
	App.onBackbutton = function(e) {
		//alert('e:backbutton');
		console.log('e:backbutton');
		//exit app
		navigator.app.exitApp();
		device.exitApp();
	};

	/* ------------------------------------------------------------------------------ */
	/* init */	
	App.init = function() {
		//starting app
		if ( !window.Platform.iOS && !window.Platform.android ) {
			//alert('NOT running on iOS/Android');
			console.log('NOT running on iOS/Android');
			//set onDevice flag
			App.onDevice = false;
			//manually start app when not on a device
			this.onDeviceReady();
		} else {
			//alert('running on iOS/Android');
			console.log('running on iOS/Android');
			//set onDevice flag
			App.onDevice = true;
			//attach phoneGap events
			document.addEventListener('deviceready', this.onDeviceReady, false);
			document.addEventListener("resume", this.onResume, false);
			document.addEventListener("backbutton", this.onBackbutton, false);
		}

		//only continue if there's jQuery/Zepto
		if (!$) return false;

		//init app modules
		App.utils.init();
		App.view.init();
		App.data.init();
	};

	return App;

})(window.App);

//init App
App.init();
