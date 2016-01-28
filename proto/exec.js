
module.exports = (function(ScribuntoConsole){

	var http = require('http');
	var Promise = (typeof Promise !== "undefined" ? Promise : require('promise'));
	var extend = require('extend');
	var querystring = require('querystring');
	
	/**
	 * @name exec
	 * @memberof! ScribuntoConsole#
	 */
	ScribuntoConsole.fn.exec = function(question, parseWikiText){
		var _this = this,
			postData = (this.content ? querystring.stringify({'content' : this.content}) : ''),
			opts = extend(true, {}, this.serverOptions,
				{
					path: (_this.options.wikiAPIPath || '/api.php') + '?' + this.getQuery({question: question}),
					headers: {
						'Content-Length': postData.length
					}
				}
			);
		
		this.clearOnNextExec = false;
		
		var pData, o = '', r = {success: false, exec: null};
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
						pData = JSON.parse(o);
						
						if('sessionIsNew' in pData && pData.session){
							_this.session = pData.session;
						}
						
					} catch(e) {
						console.log('Error', e);
						if(ScribuntoConsole.debug) console.log('BODY: ', o);
						r.exec = r.error = e;
						return respond(r, false);
					}
					
					r.exec = pData;
					if(parseWikiText) {
						_this.parseWiki(pData.print).then(function(parseData){
							if(parseData && parseData.parse){
								r.parse = parseData.parse;
								r.success = (parseData.success === true);
							} else {
								r.parse = parseData;
								r.error = parseData.error || (new Error('No parse data returned.'));
							}
							respond(r, r.success);
						}, function(err){
							r.parse = r.error = (err && err.parse ? err.parse : err);
							return respond(r, false);
						});
					} else {
						r.success = true;
						return respond(r);
					}
				});
			});

			req.on('error', function(e){
				console.log('problem with request: ', e.message);
				r.exec = r.error = e;
				respond(r, false);
			});

			req.write(postData);
			req.end();
		});
	};
	
});