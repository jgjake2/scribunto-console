/**
 * Shirt module.
 * @module ScribuntoConsole
 */
 
module.exports = (function(){
	//var fs = require('fs');
	
	var extend = require('extend');
	var querystring = require('querystring');
	
	/**
	 * Constructs an instance of ScribuntoConsole
	 * @name ScribuntoConsole
	 * @class
	 * @@classdesc Description of ScribuntoConsole....
	 * @param {Object} options - 
	 * @param {string} [txt] - Module content
	 */
	function ScribuntoConsole(options, txt){
		this.options = extend(true, {}, ScribuntoConsole.defaults, options || {});
		this.session = null;
		this.content = null;
		
		this.serverOptions = extend(true, {}, ScribuntoConsole.ServerDefaults,
			{
				hostname: this.options.wikiHostName,
				path: this.options.wikiAPIPath
			}
		);
		
		if(typeof txt == "string")
			this.setContent(txt);
		
		if(options.setAsDefault)
			ScribuntoConsole.setServerDefaults(this.serverOptions);
		
		return this;
	}
	
	ScribuntoConsole.defaults = {
		wikiHostName: 'starwars.wikia.com',
		wikiAPIPath: '/api.php',
		stripComments: true
	};
	
	ScribuntoConsole.ServerDefaults = {
		port: 80,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': 0
		}
	};
	
	Object.defineProperties(ScribuntoConsole.ServerDefaults, {
		/**
		 * @property {string}
		 * @name ScribuntoConsole.ServerDefaults#hostname
		 */
		hostname: {
			get: function(){return ScribuntoConsole.defaults.wikiHostName;},
			set: function(v){ScribuntoConsole.defaults.wikiHostName = v;},
			enumerable: true,
			configurable: false
		},
		
		/**
		 * @property {string}
		 * @name ScribuntoConsole.ServerDefaults#path
		 */
		path: {
			get: function(){return ScribuntoConsole.defaults.wikiAPIPath;},
			set: function(v){
				ScribuntoConsole.defaults.wikiAPIPath = v;
				try {ScribuntoConsole.defaults.wikiAPIPath = ScribuntoConsole.defaults.wikiAPIPath.split('?')[0];} catch(e) {}
			},
			enumerable: true,
			configurable: false
		}
	});
	
	ScribuntoConsole.debug = false;
	ScribuntoConsole.fn = ScribuntoConsole.prototype;
	
	ScribuntoConsole.setServerDefaults = function(obj){
		ScribuntoConsole.ServerDefaults = extend(true, ScribuntoConsole.ServerDefaults, obj || {});
		
		return ScribuntoConsole;
	};
	/*
	function forEachFile(dirPath, callback){
		var files = fs.readdirSync(dirPath);
		for (var i in files){
			var fPath = dirPath + '/' + files[i];
			if (fs.statSync(fPath).isFile()){
				try {callback(fPath, files[i]);} catch(e) {}
			}
		}
	}
	
	function requireMember(filePath){return require(filePath)(ScribuntoConsole);}
	
	forEachFile('./static', requireMember);
	forEachFile('./proto', requireMember);
	*/
	
	/* Static Members */
	require('./static/parseWikiText.js')(ScribuntoConsole);
	
	/* Prototype */
	require('./proto/exec.js')(ScribuntoConsole);
	require('./proto/clear.js')(ScribuntoConsole);
	require('./proto/getQuery.js')(ScribuntoConsole);
	require('./proto/parseWiki.js')(ScribuntoConsole);
	require('./proto/setContent.js')(ScribuntoConsole);
	require('./proto/setContentFromFile.js')(ScribuntoConsole);
	require('./proto/setContentFromPage.js')(ScribuntoConsole);
	
	return ScribuntoConsole;
})();
