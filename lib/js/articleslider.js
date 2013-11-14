/* Notes:
 * - Updated from pageslider.js for custom requirements of article loading
 */

function ArticleSlider() {
	
	// vars
    var $currentArticle,
		initiated = [],
		allCls = 'transition in out norm';
	
    // slideArticle
    this.slideArticle = function(seg, $container, $article, effect) {		
		//default effect
		effect = effect || 'in';
		
		//add article to dom
		$container.append( $article );
		
		// Prep the article at the starting state of the animation
		$article.removeClass(allCls);
		$article.addClass(effect);
		
		//init new article upon load
		App.view.initArticle($article);
		
		//remove article upon transition end
		if ( $currentArticle ) {
			$currentArticle.one('webkitTransitionEnd', function(e) {
				$(this).remove();
			});
		}
		
		//init new article upon shown/transition end
		$article.one('webkitTransitionEnd', function(e) {
			App.view.transitionStatus.articleSlider = false;
			App.view.initArticleShown($article);
		});
		
		// Force reflow. More information here: http://www.phpied.com/rendering-repaint-reflowrelayout-restyle/
		$container[0].offsetWidth;
		
		// update transition status
		App.view.transitionStatus.articleSlider = true;
		
		// Position the new article and the current article at the ending state of their effects with a transition class
		$article.removeClass(allCls);
		$article.addClass('transition norm');
		
		if ( $currentArticle ) {
			$currentArticle.removeClass(allCls);	   
			$currentArticle.addClass('transition ' + (effect === 'in' ? 'out' : 'in'));
		}
		$currentArticle = $article;	
		
		//update article segment init status
		initiated[seg] = true;
		console.log('[articleSlider]: segment status: ', initiated);
    }

}