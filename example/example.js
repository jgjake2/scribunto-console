
/* Create new instance */
var ScribuntoConsole = require('../scribunto-console.js');

function readFileExample(){
	var consoleFile = new ScribuntoConsole({
		hostname: 'starwars.wikia.com',
		apiPath: '/api.php',
		title: 'Module:TitleParts'
	});

	consoleFile.setContentFromFile('./example/TitleParts.lua');
	
	// Execute 'p.debug'
	consoleFile.exec('p.debug()').then(function(data){
		console.log(data.exec.print);
	}, function(e){
		console.log('Error', e);
	});
}

readFileExample();

function remoteModuleExample(){
	var consoleRemoteModule = new ScribuntoConsole({
		hostname: 'starwars.wikia.com',
		apiPath: '/api.php',
		title: 'Template:UprisingPageFooter'
	});
	
	// Get the source for 'Module:UprisingPageFooter'
	consoleRemoteModule.setContentFromPage('Module:UprisingPageFooter').then(function(a){
	
		// Execute 'p._debug()' and parse the resulting WikiText
		consoleRemoteModule.exec('p._debug()', true).then(function(data){
			console.log(data);
		}, function(e){
			console.log('Error', e);
		});
		
	}, function(e){
		console.log('error', e);
	});
}

remoteModuleExample();
