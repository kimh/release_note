[![Circle CI](https://circleci.com/gh/kimh/release_note.svg?style=svg)](https://circleci.com/gh/kimh/release_note)

# ReleaseNote
ReleaseNote is a notification aggregation service for software releases.

## Why?
How do you keep track of new releases of software that you are interested in? Subscribe to mailing lists? RSS?

Isn't it great if there is a single service that notifies you every new release of your favorite software?

ReleaseNote does this for you. ReleaseNote craws release notes of popular software and will notify subscribers when there are new releases.

## List of tracked releases
As of now, only tracking docker since that's what I wanted to keep track of, but I'm going to add more very soon.

- docker https://github.com/docker/docker 

## How to subscribe
Fork this project, add your email address to [subscribers.json](https://github.com/kimh/release_note/blob/master/subscribers.json) and make a PR!

## Deployment
It's running on Heroku and automatically built and deployed by CircleCI. You just need to `git push` to Github and CircleCI will automatically deploy the new app.

## Development Status
Currently ReleaseNote only does a minimal thing. That is, periodically checking releases and sends you emails. No fansy web UI nor easy ways to subscrbie/unsubscribe.

But it works! I will make it more user friendly in the future.

