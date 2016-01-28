
module.exports = (function(ScribuntoConsole){
	
	ScribuntoConsole.fn.clear = function(){
		this.clearOnNextExec = true;
		return this.exec('');
	};
	
});