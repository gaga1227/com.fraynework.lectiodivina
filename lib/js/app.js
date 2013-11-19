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
		console.log('[device] e:deviceready');
	};

	//onPause
	App.onPause = function(e) {
		console.log('[device] e:pause');
		//killAudio (pause)
		App.view.killAudio();
	};

	//onResume
	App.onResume = function(e) {
		console.log('[device] e:resume');
	};
	
	//onOnline
	App.onOnline = function(e) {
		console.log('[device] e:online');
	};
	
	//onOffline
	App.onOffline = function(e) {
		console.log('[device] e:offline');
		//killAudio (release)
		App.view.killAudio(true);
		//notify
		navigator.notification.alert(
			// message
			'The Lectio Divina App requires internet connection to playback audio.',
			// callback
			function(){},
			// title
			'Internet Connection Lost',
			// buttonName
			'OK'			
		);
	};
		
	//onBackbutton
	App.onBackbutton = function(e) {
		console.log('[device] e:backbutton');
		//exit app
		navigator.app.exitApp();
		device.exitApp();
	};

	//onMenubutton
	App.onMenubutton = function(e) {
		console.log('[device] e:menubutton');
		//killAudio (pause)
		App.view.killAudio();
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
			document.addEventListener('deviceready',	this.onDeviceReady, 	false);
			document.addEventListener("pause", 			this.onPause, 			false);
			document.addEventListener("resume", 		this.onResume, 			false);
			document.addEventListener("online", 		this.onOnline, 			false);
			document.addEventListener("offline", 		this.onOffline,			false);
			document.addEventListener("backbutton", 	this.onBackbutton, 		false);
			document.addEventListener("menubutton", 	this.onMenubutton, 		false);
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
