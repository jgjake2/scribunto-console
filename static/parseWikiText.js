
module.exports = (function(ScribuntoConsole){

	var http = require('http');
	var Promise = (typeof Promise !== "undefined" ? Promise : require('promise'));
	var extend = require('extend');
	var querystring = require('querystring');
	
	/**
	 * @name parseWikiText
	 * @memberof! ScribuntoConsole.
	 * @param {string} txt - Text to be parsed content
	 * @param {Object} [options] - Options
	 */
	ScribuntoConsole.parseWikiText = function(txt, options){
		options = options || {};
		var _this = this,
			isScribuntoConsole = (_this.options && _this.options.wikiHostName ? true : false),
			postData = querystring.stringify({text: txt}),
			opts = {},
			wikiHostName = options.wikiHostName || ScribuntoConsole.defaults.wikiHostName,
			wikiAPIPath = options.wikiAPIPath || ScribuntoConsole.defaults.wikiAPIPath,
			query = {
				action: 'parse',
				format: 'json',
				title: options.title || 'API',
				contentmodel: 'wikitext',
				prop: ['text', 'langlinks', 'categories', 'links', 'templates', 'images', 'externallinks', 'sections', 'displaytitle']
			};
		
		if(isScribuntoConsole){
			if(!options.wikiHostName) wikiHostName = _this.options.wikiHostName || wikiHostName;
			if(!options.wikiAPIPath) wikiAPIPath = options.wikiAPIPath || _this.options.wikiAPIPath || wikiAPIPath;
			query.title = options.title || _this.options.title || query.title;
		}
		
		query.prop = query.prop.join('|');
		opts = extend(true, {}, ScribuntoConsole.ServerDefaults,
				{
					hostname: wikiHostName,
					path: wikiAPIPath + '?' + querystring.stringify(query),
					headers: {
						'Content-Length': postData.length
					}
				}
			);
		
		var o = '';
		var r = {success: false, parse: null};
		return new Promise(function(resolve, reject){
			var responded = false,
				respond = function(a, b){
					if(!responded){
						responded = true;
						if(b === false){
							return reject(a);
						}
						return resolve(a);
					}
				};
			
			var req = http.request(opts, function(res){
				if(ScribuntoConsole.debug) console.log('STATUS: ', res.statusCode);
				if(ScribuntoConsole.debug) console.log('HEADERS: ', JSON.stringify(res.headers, null, '\t'));
				res.setEncoding('utf8');
				
				res.on('data', function(chunk){
					if(chunk) o += chunk;
				});
				res.on('end', function(){
					if(ScribuntoConsole.debug) console.log('No more data in response.');
					try {
						var pData = JSON.parse(o);
						
						//return respond(pData);
					} catch(e) {
						console.log('Error', e);
						if(ScribuntoConsole.debug) console.log('BODY: ', o);
						r.parse = r.error = e;
						return respond(r, false);
					}
					
					if(pData.parse){
						r.parse = pData.parse;
						r.success = true;
					} else {
						r.parse = pData;
						r.error = new Error('Invalid response returned from the server.');
					}
					return respond(r, r.success);
				});
			});

			req.on('error', function(e){
				console.log('problem with request: ', e.message);
				r.parse = r.error = e;
				return respond(r, false);
			});

			req.write(postData);
			req.end();
		
		});
	};
	
});