var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var path = require('path');
var assert = require('assert');
var _ = require('underscore');
//var express = require('express');
//var app     = express();

function write_output(output_file, json) {
    fs.writeFile(output_file, JSON.stringify(json, null, 4), function(err){
	if (err)
        throw (err);
    })
}

function read_json_output(file_path) {
    if (fs.existsSync(file_path)) {
	return JSON.parse(fs.readFileSync(file_path, 'utf8'));
    } else {
	throw new Error("file doesn't exist: " + file_path);
    }
 }

function github_standard_release(name, url) {
    var releases_json = [];


    return new Promise(function(resolve) {

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
			
			json.version = version;
			json.title = title;
			json.description = desc;

			releases_json.push(json)
		    })
		});

		resolve(releases_json);
	    }   
	});
    })
	
}

function check_release(name, url) {
    var dir = 'data';
    var json_file = path.join(dir, name + ".json");

    if (!fs.existsSync(dir)) {fs.mkdirSync(dir);}

    github_standard_release(name, url).then(function(new_releases_json) {
	var old_releases_json = read_json_output(json_file);

	if (!_.isEqual(old_releases_json, new_releases_json)) {
	    console.log("New releases for %s", name);
	    write_output(json_file, new_releases_json);
	} else {
	    console.log("No changes for %s", name);
	}
    });
}

function docker() {
    check_release("docker", "https://github.com/docker/docker/releases");
}

function my_release() {
    check_release("my_release", 'https://github.com/kimh/release_note/releases');
}

my_release();
docker();
