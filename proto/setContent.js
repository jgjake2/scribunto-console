
module.exports = (function(ScribuntoConsole){
	
	var getBlockComment = /^(--\[\[\s*[\r\n]+(?:(?![^\\]\]\]--)[\s\S])+[.\s\r\n]\]\]--[^\r\n]*?)/m;
	function stripComments(str){
		var result;
		while ((result = getBlockComment.exec(str)) !== null) {
			if(result[1]){
				var stripped = result[1].replace(/[^\r\n]+/g, '');
				
				str = str.substring(0, result.index) + stripped + str.substring(result.index + result[1].length)
			} else
				break;
		};
		
		str = str.replace(/^--[^\[][^\r\n]*$/gm, '');
		
		return str;
	}
	
	ScribuntoConsole.fn.setContent = function(txt){
		if(this.options.stripComments){
			txt = stripComments(txt);
		}
		
		this.content = txt;
		
		return (this.content ? true : false);
	};

});