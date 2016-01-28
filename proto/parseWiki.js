
module.exports = (function(ScribuntoConsole){

	/**
	 * @name parseWiki
	 * @memberof! ScribuntoConsole#
	 * @param {string} txt - Text to be parsed content
	 * @param {Object} [options] - Options
	 */
	ScribuntoConsole.fn.parseWiki = function(txt, options){
		return ScribuntoConsole.parseWikiText.call(this, txt, options);
	};
	
});