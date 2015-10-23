# ReleaseNote
ReleaeNote is a notification aggregation service for releases.

## Why?
How do you keep track of new releases of software that you are interested? Subscribe to mailing lists? RSS?
Isn't it great if there is a single service that notifies you every new release that you are interested in?

ReleaseNote exactly does this. ReleaseNote craws release notes of major software and will notify subscribers when there are new releases.

## List of tacking releases
As of now, only tracking docker since that's I wanted to keep track of, but I'm going to add more very soon.

- docker https://github.com/docker/docker 

## How to subscribe?
Add your email address to [subscribers.json](https://github.com/kimh/release_note/blob/master/subscribers.json) and make a PR!

## Deployment
It's running on Heroku and automatically build and deploy by CircleCI. You just need to `git push` to Github and CircleCI will automatically deploy the new app.
