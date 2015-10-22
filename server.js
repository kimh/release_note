var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var path = require('path');
var assert = require('assert');
var _ = require('underscore');
var nodemailer = require('nodemailer');
var sleep = require('sleep-async')();
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
	return false;
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

function send_mail(user, pass, mail_opt) {
    var transporter = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
            user: user,
            pass: pass
	}
    });

    // send mail with defined transport object
    transporter.sendMail(mail_opt, function(error, info){
	if(error){
            return console.log(error);
	}
	console.log("Email sent to: %s", mail_opt.to);
    });
}

function send_update_notification(option) {
    var user, pass;
    
    var receiver_address = option.to;
    var subject = option.subject;
    var body = option.body;
    var dry_run = option.dry_run || false;

    if (process.env.RN_EMAIL_USER) {
	user = process.env.RN_EMAIL_USER;
    } else {
    	throw new Error("You need to set $RN_EMAIL_USER for email notification");
    }

    if (process.env.RN_EMAIL_PASS) {
	pass = process.env.RN_EMAIL_PASS;
    } else {
    	throw new Error("You need to set $RN_EMAIL_PASS for email notification");
    }
	
    
    var mail_options = {
	from: 'Kim Hirokuni ✔ <yangkookkim@gmail.com>',
	to: receiver_address,
	subject: subject,
	text: body
    };

    if (dry_run) {
	console.log("Supress sending actual email");
	console.log(mail_options);
    } else {
	send_mail(user, pass, mail_options);
    }
}

function new_release(new_releases_json, old_releases_json) {
    var changes = [];

    new_releases_json.forEach(function(a) {
	var diff = old_releases_json.some(function(b) { return _.isEqual(a, b) })
	if (!diff) { changes.push(a) }
    })

    return changes
}

function check_release(name, url) {
    var dir = 'data';
    var json_file = path.join(dir, name + ".json");
    var email_subject, email_body;

    if (!fs.existsSync(dir)) {fs.mkdirSync(dir);}

    github_standard_release(name, url).then(function(new_releases_json) {
	var old_releases_json = read_json_output(json_file);

	if (old_releases_json) {
	    var changes = new_release(new_releases_json, old_releases_json);

	    if (!_.isEmpty(changes)) {
		//if (true) {
		console.log("New releases for %s", name);
		email_subject = "New release for " + name;
		email_body = JSON.stringify(changes);
		send_update_notification({to: 'yangkookkim@gmail.com', subject: email_subject, body: email_body, dry_run: false});
	    } else {
		console.log("No changes for %s", name);
	    }
	} else {
	    console.log("Hoge Skipping release checking because old release json file doesn't exist: %s", json_file);
	}

	write_output(json_file, new_releases_json);
    });
}

function docker() {
    check_release("docker", "https://github.com/docker/docker/releases");
}

function my_release() {
    check_release("my_release", "https://github.com/kimh/release_note/releases");
}

setInterval(function() {
    console.log(Date.now());
    my_release();
}, 60000);


//docker();
