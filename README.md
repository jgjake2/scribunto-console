# [scribunto-console](https://www.npmjs.com/package/scribunto-console)
[jgjake2](http://starwars.wikia.com/wiki/User:Jgjake2)

## Description

Node module for remote debugging of MediaWiki Lua Modules using the scribunto console API.

## Usage

```javascript
var SC = new ScribuntoConsole({
	hostname: 'MYWIKI.wikia.com',
	apiPath: '/path/to/api.php',
	title: 'Page Name for Parsing Context'
});
```

### SC.clear ()

### SC.exec (question, parseWikiText) <sub><sup>`Promise(function(responseObject){}, function(errorResponse){})`</sup></sub>
| Name | Type | Description |
| :--- | --- | --- |
| `question` | String | The command to be executed. |
| `parseWikiText` | Boolean | Parse the WikiText before returning. |

### SC.setContent (txt)

###SC.setContentFromFile (fileName)
| Name | Type | Description |
| :--- | --- | --- |
| `fileName` | String | Lua script file. |

**Example**
```javascript
var SC = new ScribuntoConsole({
	hostname: 'starwars.wikia.com',
	apiPath: '/api.php',
	title: 'Module:TitleParts'
});

// Load a lua script from a file
SC.setContentFromFile('./example/TitleParts.lua');

// Execute the command 'p.debug()' from the console
SC.exec('p.debug()').then(function(data){

	// The server's JSON response is stored in 'data.exec'
	// The console's output is in 'data.exec.print'
	console.log(data.exec.print);
	
}, function(e){
	console.log('Error', e);
});
```

### setContentFromPage (title) <sub><sup>`Promise(function(responseObject){}, function(errorResponse){})`</sup></sub>
| Name | Type | Description |
| :--- | --- | --- |
| `title` | String | Wiki page (including namespace) to load Lua script from. |
You can execute console commands on remote modules by first downloading their content using `setContentFromPage`.

**Example**
```javascript
var SC = new ScribuntoConsole({
	hostname: 'starwars.wikia.com',
	apiPath: '/api.php',
	title: 'Template:UprisingPageFooter'
});

// Get the source for 'Module:UprisingPageFooter'
SC.setContentFromPage('Module:UprisingPageFooter').then(function(a){

	// Execute 'p._debug()' and parse the resulting WikiText
	SC.exec('p._debug()', true).then(function(data){
	
		// Both the original, and parsed responses are returned.
		// The console's output is in 'data.exec.print'
		// The parsed response is in 'data.parse', and the parsed text is in 'data.parse.text["*"]'
		console.log(data);
		
	}, function(e){
		console.log('Error', e);
	});
	
}, function(e){
	console.log('error', e);
});
```

## ToDo
* Remove all synchronous calls and return a promise instead (file I/O)
* Make all server request methods static, but use an instance's data/options when called by a prototype function.
* Add/Update documentation.

## Reporting Issues

if you find a bug or would like to make a feature request, [please open a new issue][issues].

## License
MIT