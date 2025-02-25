---
title: A Hard Intro to Docker DNS Rules
description: Learning about Docker DNS Rules, the hard way
date: 2025-02-08
tags: web-dev
layout: layouts/post.njk
---

## Background
I'm currently writing this post as I wait for `apt-get update` to run in a docker container on my homelab. Why is it running so slow you ask? And why am I trying to update and install anything in a docker container to begin with? Because my DNS overwrite rules aren't functioning and it's causing auth within my homelab to break.

I've recently been working on my homelab, and while it's coming along nicely, I'm learning a lot of little quirks along the way.

## Architecture

1. I have everything hosted internally and only internally.
2. I'm using [caddy](https://caddyserver.com/) as a reverse proxy that allows everything to run on a single domain with certificates for https domains.
3. I'm using my [pihole](https://pi-hole.net/) as a DNS server so I've overwritten all my DNS entries locally. [I'm not leaking specifics about my internal network to the world via actual DNS records.](https://security.stackexchange.com/questions/79704/security-risk-with-using-internal-ip-on-public-dns). I don't actually care that much about leaking data but there is a cleanliness thing to it.
4. I am running [Authentik](https://goauthentik.io/) for auth and have even managed to use Sign on with Apple as a source.

This is all working great, except I'm having one issue. In one single app, sign on with apple isn't working via Authentik. I've debugged this down to the fact that during the handshake process between Apple, Authentik and the App itself Apple is being told to redirect back to a local IP. This is against the rules of using Sign in with Apple. I've set this IP because it originally wasn't working when I set my reverse proxied domain name. I thought I had to do it this way and just had something funky to do with the caddy config. Turns out I was wrong.

Through more debugging I've discovered that every one of my other docker containers is using my pihole as a DNS and properly attributing my domain to my internal server IP. I could just set a public DNS record, but as mentioned before for the sake of cleanliness and uniformity I don't want to do that. 

I opened an interactive shell into the docker container and `cat /etc/resolv.conf` when I'm hit with this:
```
# Generated by Docker Engine.
# This file can be edited; Docker Engine will not make further changes once it
# has been modified.

nameserver 127.0.0.11
search expressvpn
options ndots:0

# Based on host file: '/etc/resolv.conf' (internal resolver)
```

Now it makes sense, I originally started this docker container when I had [expressvpn](https://www.expressvpn.com/) activated, so it just copied the resolv.conf file from my host, which at the time was overwriten by expressvpn to use their servers as a DNS authority.

Now, I'm attempting to update and install nano on the docker container so that I can update the resolve.conf file and change the DNS settings to point to my pihole and properly resolve my internal only domain. Then I will be able to properly login with Apple.

I'm strongly considering just rebuilding the whole docker compose file now that I have deactivated expressvpn which should rewrite the resolv.conf file and make everything work. However, this is a image hosting container that has over 100gb of personal photos, and I'm not positive I've set up volumes on the container properly that everything will be saved.