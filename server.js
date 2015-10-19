var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

url = 'https://github.com/kimh/release_note/releases/tag/0.0.1';

request(url, function(error, response, html){
    if(!error){
	var $ = cheerio.load(html);

	var version, title, description;
	var json = { version: "", title: "", description: "" };

	var version = $('.release-meta .css-truncate-target').text()
    }


    console.log("version: %s", version);
})

exports = module.exports = app; 	
