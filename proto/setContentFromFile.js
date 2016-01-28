
module.exports = (function(ScribuntoConsole){
	var fs = require.main.require('fs');
	
	ScribuntoConsole.fn.setContentFromFile = function(filePath){
		var file = fs.readFileSync(filePath, 'utf8');
		if(file){
			this.setContent(file);
			
			return true;
		}
		return false;
	};
	
});