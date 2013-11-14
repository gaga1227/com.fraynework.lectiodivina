/* Notes:
 * - History management is currently done using window.location.hash. This could easily be changed to use Push State instead.
 * - jQuery dependency for now. This could also be easily removed.
 * - JX: 20130723 updated var names to suit conventions
 * - JX: 20130723 added page load and shown init functions
 */

function PageSlider($container) {

    var $currentPage,
        stateHistory = [],
		allCls = 'transition left right center';

    // Use this function if you want PageSlider to automatically determine the sliding direction based on the state history
    this.slidePage = function($page) {
        var l = stateHistory.length,
            state = window.location.hash;
        if (l === 0) {
            stateHistory.push(state);
            this.slidePageFrom($page);
            return;
        }
        if (state === stateHistory[l-2]) {
            stateHistory.pop();
            this.slidePageFrom($page, 'left');
        } else {
            stateHistory.push(state);
            this.slidePageFrom($page, 'right');
        }
    }
	
    // Use this function directly if you want to control the sliding direction outside PageSlider
    this.slidePageFrom = function($page, from) {
        //add page to dom
		$container.append( $page );
				
		//default page
        if (!$currentPage || !from) {
            $page.addClass('center');
            $currentPage = $page;
			App.view.initPage($page);
            return;
        }

        // Position the page at the starting position of the animation
		$page.removeClass(allCls);
		$page.addClass(from);
		
		//init new page upon load
		App.view.initPage($page);
		
		//remove page upon transition end
        $currentPage.one('webkitTransitionEnd', function(e) {
            $(this).remove();
        });
		
		//init new page upon shown/transition end
        $page.one('webkitTransitionEnd', function(e) {
			App.view.transitionStatus.pageSlider = false;
			App.view.initPageShown($page);
        });
		
		// Force reflow. More information here: http://www.phpied.com/rendering-repaint-reflowrelayout-restyle/
        $container[0].offsetWidth;
		
		// update transition status
		App.view.transitionStatus.pageSlider = true;

        // Position the new page and the current page at the ending position of their animation with a transition class indicating the duration of the animation
        $page.removeClass(allCls);
		$page.addClass('transition center');
		
		$currentPage.removeClass(allCls);	   
		$currentPage.addClass('transition ' + (from === 'left' ? 'right' : 'left'));
		$currentPage = $page;
    }

}