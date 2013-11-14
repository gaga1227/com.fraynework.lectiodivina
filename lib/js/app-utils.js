/* ------------------------------------------------------------------------------ */
/* rAF */
/* ------------------------------------------------------------------------------ */
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

/* ------------------------------------------------------------------------------ */
/* App - utils */
/* ------------------------------------------------------------------------------ */
window.App = (function(app){

	//create empty App obj if none found
	var App = app || {};

	/* ------------------------------------------------------------------------------ */
	/* utils - logger */
	window.Logger = function() {
		var oldConsoleLog = null,
			pub = {};
		pub.enableLogger = function enableLogger() {
			if(oldConsoleLog == null) return;
			window['console']['log'] = oldConsoleLog;
		};
		pub.disableLogger = function disableLogger() {
			oldConsoleLog = console.log;
			window['console']['log'] = function() {};
		};
		return pub;
	}();

	/* ------------------------------------------------------------------------------ */
	/* utils - Platform */
	window.Platform = new function(){
		//detecting functions
		function checkPlatform(os) { return (navigator.userAgent.toLowerCase().indexOf(os.toLowerCase())>=0); }
		function checkEvent(e) { return (e in document.documentElement); }
		//add properties
		this.iPhone = checkPlatform('iPhone');
		this.iPad = checkPlatform('iPad');
		this.iPod = checkPlatform('iPod');
		this.iOS = this.iPhone||this.iPad||this.iPod;
		this.android = checkPlatform('android');
		this.touchOS = checkEvent('ontouchstart');
		this.debugLog = function(){
			console.log('iPhone: '+this.iPhone);
			console.log('iPad: '+this.iPad);
			console.log('iPod: '+this.iPod);
			console.log('iOS: '+this.iOS);
			console.log('android: '+this.android);
			console.log('touchOS: '+this.touchOS);
		}
		//return self
		return this;
	}

	/* ------------------------------------------------------------------------------ */
	/* utils - alert */
	if ( !window.Platform.iOS && !window.Platform.android ) {
		window.alert = function(msg){ console.log('window.alert: '+msg); }
	}

	/* ------------------------------------------------------------------------------ */
	/* utils */
	App.utils = {

		/* ------------------------------------------------------------------------------ */
		/* addDeviceClass */
		addDeviceClass:	function() {
			var p = Platform;
				$html = $('html:eq(0)');
			$html.removeClass('no-js').addClass('js');
			if (p.touchOS) {
				$html.addClass('touch');
			}
			else {
				$html.addClass('no-touch');
			}
			if (p.iOS) {
				$html.addClass('ios');
				if (p.iPhone) {	$html.addClass('iphone'); }
				else if (p.iPod) {	$html.addClass('ipod'); }
				else if (p.iPad) {	$html.addClass('ipad'); }
			}
			else if (p.android) {
				$html.addClass('android');
			}
		},

		/* ------------------------------------------------------------------------------ */
		/* checkConnection */
		checkConnection: function() {
			//exit if no API
			if ( !navigator.connection ) return false;
			//vars
			var networkState = navigator.connection.type;
			//return state
			return networkState;
		},

		/* ------------------------------------------------------------------------------ */
		/* reloadApp */
		reloadApp: function() {
			//update to main app file address without page id
			window.location = String(window.location).substr(0, String(window.location).indexOf('#'));
		},

		/* -------------------------------------------------------------------------- */
		/* getVarsFromSearch */
		getVarsFromSearch: function(search) {
			var oSearchVars = {},
				hash = window.location.hash,
				searchStr = search || hash.substr(hash.indexOf('?'));
			if (searchStr.length > 1) {
				for (var aItKey, nKeyId = 0, aCouples = searchStr.substr(1).split('&'); nKeyId < aCouples.length; nKeyId++) {
					aItKey = aCouples[nKeyId].split('=');
					oSearchVars[unescape(aItKey[0])] = aItKey.length > 1 ? unescape(aItKey[1]) : '';
				}
			}
			return oSearchVars;
		},

		/* -------------------------------------------------------------------------- */
		/* getURLFromHash */
		getURLFromHash: function(hash) {
			var url = '',
				dft = 'home'
				ext = '.html',
				hashStr = hash || window.location.hash;
			//remove param vars from string
			if ( hashStr.indexOf('?') != -1 ) {
				hashStr = hashStr.substr(0, hashStr.indexOf('?'));
			}
			//update string to valid url
			if (hashStr.length > 2) {
				//process hash string
				url = hashStr.substr(1).replace('_', '/');
			} else {
				url = dft;
			}
			return url + ext;
		},

		/* -------------------------------------------------------------------------- */
		/* getBranchFromHash */
		getBranchFromHash: function(hash) {
			var branch = '',
				hashStr = hash || window.location.hash;
			//remove param vars from string
			if ( hashStr.indexOf('?') != -1 ) {
				branch = hashStr.substr(0, hashStr.indexOf('?'));
			}
			return branch;
		},

		/* -------------------------------------------------------------------------- */
		/* getToday */
		getToday: function(){
			var date = new Date(),
				day = date.getDay();
			return day;
		},
		
		/* -------------------------------------------------------------------------- */
		/* attachCSSAnim */
		attachCSSAnim: function($target, animCls) {
			if ( !$target.length || !animCls ) return false;
			var scopeCls = 'animated',
				cls = scopeCls + ' ' + animCls;
			$target
				.addClass(cls)
				.one('webkitAnimationEnd', function(e) {
					$target.removeClass(cls);
				});
		},
		
		/* ------------------------------------------------------------------------------ */
		/* init */
		init: function() {
			//alert('app.utils.init()');
			this.addDeviceClass();
		}

	};

	return App;

})(window.App);
