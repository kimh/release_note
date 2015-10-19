var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var path = require('path');
var path = require('path');
//var express = require('express');
//var app     = express();

function write_output(output_file, json) {
    fs.writeFile(output_file, JSON.stringify(json, null, 4), function(err){
	console.log('done');
    })
}

function test_release(name) {
    var url = 'https://github.com/kimh/release_note/releases';

    request(url, function(error, response, html){
	if(!error){
	    var $ = cheerio.load(html);
	    var releases = $('.release');
	    var latest = releases.first();
	    var output_json = name + ".json";
	    
	    latest.filter(function() {
		var data = $(this);
    		var version, title, description;
		var json = { name: name, version: "", title: "", description: "" };

		var version = data.find(".release-meta .css-truncate-target").text().trim()
		var title   = data.find('.release-body .release-title').text().trim()
		var desc    = data.find('.release-body .markdown-body').text().trim()
		
		console.log("version: %s", version);
		console.log("title: %s", title);
		console.log("description: %s", desc);

		json.version = version;
		json.title = title;
		json.description = desc;

		write_output(path.join('data', output_json), json);
	    })	
	}
    })
}

test_release("my_release");


//exports = module.exports = app; 	
