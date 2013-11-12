/* Notes:
 * - Updated from pageslider.js for custom requirements of article loading
 */

function ArticleSlider() {
	
	// vars
    var $currentArticle,
		allCls = 'transition in out norm';
	
    // slideArticle
    this.slideArticle = function($container, $article, effect) {		
		//add article to dom
		$container.append( $article );
				
		//default article
        if (!$currentArticle || !effect) {
            $article.removeClass(allCls);
			$article.addClass('norm');
            $currentArticle = $article;
            return;
        }
		
        // Prep the article at the starting state of the animation
        $article.removeClass(allCls);
		$article.addClass(effect);
		
		//init new article upon load
		App.view.initArticle($article);
		
		//remove article upon transition end
        $currentArticle.one('webkitTransitionEnd', function(e) {
            $(this).remove();
        });
		
		//init new article upon shown/transition end
        $article.one('webkitTransitionEnd', function(e) {
			App.view.initArticleShown($article);
        });
		
		// Force reflow. More information here: http://www.phpied.com/rendering-repaint-reflowrelayout-restyle/
        $container[0].offsetWidth;

        // Position the new article and the current article at the ending state of their effects with a transition class indicating the duration of the animation
		$article.removeClass(allCls);
		$article.addClass('transition norm');
		
		$currentArticle.removeClass(allCls);	   
        $currentArticle.addClass('transition ' + (effect === 'in' ? 'out' : 'in'));
        $currentArticle = $article;
    }

}