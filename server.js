var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var path = require('path');
//var express = require('express');
//var app     = express();

function write_output(output_file, json) {
    fs.writeFile(output_file, JSON.stringify(json, null, 4), function(err){
	console.log('done');
    })
}

function github_standard_release(name, url) {
    var dir = 'data';
    var output_json = path.join(dir, name + ".json");
    var releases_json = [];

    if (!fs.existsSync(dir)) {fs.mkdirSync(dir);}

    request(url, function(error, response, html){
	if(!error){
	    var $ = cheerio.load(html);
	    var releases = $('.release');
	    var latest = releases.first();

	    releases.each(function(i, release) {
		$(release).filter(function() {
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

		    releases_json.push(json)
		})
	    });
	}
	
        write_output(output_json, releases_json);
    });
}

function docker() {
    github_standard_release("docker", 'https://github.com/docker/docker/releases');
}

function my_release() {
    github_standard_release("my_release", 'https://github.com/kimh/release_note/releases');
}

//docker();
my_release();

//exports = module.exports = app; 	
