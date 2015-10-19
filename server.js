var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

url = 'https://github.com/kimh/release_note/releases';

request(url, function(error, response, html){
    if(!error){
	var $ = cheerio.load(html);
	var releases = $('.release');
	var latest = releases.first()

	latest.filter(function() {
	    var data = $(this);
	    console.log(data.find(".release-meta .css-truncate-target").text());

    	    var version, title, description;
	    var json = { version: "", title: "", description: "" };

	    var version = data.find(".release-meta .css-truncate-target").text().trim()
	    var title   = data.find('.release-body .release-title').text().trim()
	    var desc    = data.find('.release-body .markdown-body').text().trim()

	    console.log("version: %s", version);
	    console.log("title: %s", title);
	    console.log("description: %s", desc);
	})	
    }
})

exports = module.exports = app; 	
