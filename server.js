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

function parse_github_releases(name, url, selector) {
    var releases_json = [];

    return new Promise(function(resolve) {
	request(url, function(error, response, html){
	    if(!error){
		var $ = cheerio.load(html);
		var releases = $(selector.root);

		releases.each(function(i, release) {
		    $(release).filter(function() {
			var data = $(this);
    			var version, title, description;
			var json = { name: name, version: "", title: "", description: "" };

			var version = data.find(selector.version).text().trim();
			var title   = data.find(selector.title).text().trim();
			var desc    = data.find(selector.desc).text().trim();
			
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

function github_release(name, url) {
    var selector = {root: ".release",
		    version: ".release-meta .css-truncate-target",
		    title: ".release-body .release-title",
		    desc: ".release-body .markdown-body"};

    return parse_github_releases(name, url, selector);
}

function github_release_with_tags(name, url) {
    var selector = {root: ".tag-info",
		    version: ".tag-name",
		    title: ".tag-name",
		    desc: ".commit-desc .text-small"};

    return parse_github_releases(name, url, selector);
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
	
    if (dry_run) {
	console.log("Supress sending actual email");
	console.log(option);
    } else {
	send_mail(user, pass, option);
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

function check_release(name, url, parser_fn) {
    var dir = 'data';
    var json_file = path.join(dir, name + ".json");
    var email_subject, email_body;
    var subscribers = JSON.parse(fs.readFileSync("subscribers.json", 'utf8'));

    if (!fs.existsSync(dir)) {fs.mkdirSync(dir);}

    parser_fn(name, url).then(function(new_releases_json) {
	var old_releases_json = read_json_output(json_file);

	if (old_releases_json) {
	    var changes = new_release(new_releases_json, old_releases_json);

	    if (!_.isEmpty(changes)) {
		//if (true) {
		subscribers.forEach(function(s) {
		    console.log("New releases for %s", name);
		    email_subject = "New release for " + name;
		    email_body = JSON.stringify(changes);
		    send_update_notification({to: s, subject: email_subject, body: email_body, dry_run: false});
		});
	    } else {
		console.log("No changes for %s", name);
	    }
	} else {
	    console.log("Skipping release checking because old release json file doesn't exist: %s", json_file);
	}

	write_output(json_file, new_releases_json);
    });
}

function docker() {
    check_release("docker", "https://github.com/docker/docker/releases", github_release);
}

function docker_compose() {
    check_release("docker-compose", "https://github.com/docker/compose/releases", github_release);
}

function npm() {
    check_release("npm", "https://github.com/npm/npm/releases", github_release);
}

function nodejs() {
    check_release("nodejs", "https://github.com/nodejs/node/releases", github_release_with_tags)
}

function jruby() {
    check_release("jruby", "https://github.com/jruby/jruby/releases", github_release_with_tags)
}

// Just for testing purpose
function my_release() {
    check_release("my_release", "https://github.com/kimh/release_note/releases", github_release);
}

docker_compose();

setInterval(function() {
    my_release();
    nodejs();
    npm();
    docker();
    jruby();
}, 60000);
