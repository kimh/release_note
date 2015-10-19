var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
//var express = require('express');
//var app     = express();

url = 'https://github.com/kimh/release_note/releases';

request(url, function(error, response, html){
    if(!error){
	var $ = cheerio.load(html);
	var releases = $('.release');
	var latest = releases.first()

	latest.filter(function() {
	    var data = $(this);
    	    var version, title, description;
	    var json = { version: "", title: "", description: "" };

	    var version = data.find(".release-meta .css-truncate-target").text().trim()
	    var title   = data.find('.release-body .release-title').text().trim()
	    var desc    = data.find('.release-body .markdown-body').text().trim()
	    
	    console.log("version: %s", version);
	    console.log("title: %s", title);
	    console.log("description: %s", desc);

	    json.version = version;
	    json.title = title;
	    json.description = desc;

	    fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){

		console.log('File successfully written! - Check your project directory for the output.json file');

	    })

	})	
    }
})

//exports = module.exports = app; 	
