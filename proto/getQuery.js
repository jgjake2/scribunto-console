
module.exports = (function(ScribuntoConsole){
	var extend = require('extend');
	var querystring = require('querystring');

	ScribuntoConsole.fn.getQuery = function(obj){
		var query = {
			  action: 'scribunto-console',
			  format: 'json',
			  title: (this.options.title || 'FooBar')
		};
		
		if(this.session)
			query.session = this.session;
		
		if(this.clearOnNextExec)
			query.clear = '1';
		
		if(obj)
			extend(true, query, obj);
		
		return querystring.stringify(query);
	};
	
});