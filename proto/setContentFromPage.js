
module.exports = (function(ScribuntoConsole){
	var http = require('http');
	var Promise = (typeof Promise !== "undefined" ? Promise : require('promise'));
	var extend = require('extend');
	var querystring = require('querystring');
	
	ScribuntoConsole.fn.setContentFromPage = function(title){
		var _this = this,
			opts = extend(true, {}, this.serverOptions,
				{
					method: 'GET',
					path: (_this.options.wikiAPIPath || '/api.php') + '?' + querystring.stringify({action: 'query', prop: 'revisions', format: 'json', titles: title, rvlimit: '1', rvprop: ['timestamp', 'user', 'tags', 'size', 'comment', 'content', 'contentmodel'].join('|')}),
				}
			);
		opts.headers = {};
		
		var pData, o = '', r = {success: false, query: null};
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
					} catch(e) {
						console.log('Error', e);
						if(ScribuntoConsole.debug) console.log('BODY: ', o);
						r.query = r.error = e;
						return respond(r, false);
					}
					
					if(pData && pData.query && pData.query.pages){
						for(var key in pData.query.pages){
							var tPage = pData.query.pages[key];
							if(tPage.revisions && tPage.revisions.length){
								r.query = tPage.revisions[0];
								r.query.pageid = tPage.pageid;
								r.query.title = tPage.title;
								r.query.ns = tPage.ns;
								r.success = _this.setContent(tPage.revisions[0]['*']) ? true : false;
								return respond(r, r.success);
							}
						}
					}
					
					r.query = r.error = (new Error('Invalid response from server'));
					respond(r, false);
				});
			});

			req.on('error', function(e){
				console.log('problem with request: ', e.message);
				r.query = r.error = e;
				respond(r, false);
			});

			req.end();
		});
	};
	
});
