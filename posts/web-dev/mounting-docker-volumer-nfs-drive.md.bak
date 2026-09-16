---
title: Mounting a Docker Volume on an NFS/NTFS Drive
description: Two ways to easily mount a Docker volume on an NFS/NTFS drive
date: 2025-02-10
tags: web-dev
layout: layouts/post.njk
---

## Background
My homelab runs with 2 attached ntfs drives[^1] and trying to use them as a volume is always a pain. I've come across two different methods of using them that seem to work.

[^1]: I'm not 100% sure on drive formats, but from what I've seen docker does not like creating volumes on the fly on nfs/ntfs the typical way of just declaring them as volumes in the Docker compose file

## Method 1 - Precreate a Named Volume

1. Create a named volume as standard:
```
docker volume create --opt device=path/to/mountpoint volume-name
```
Feel free to add other options as needed

2. Then in creation of the docker compose just use the mounted volume as normal:
```
services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - volume-name:/usr/share/nginx/html
volumes:
  volume-name:
```

## Method 2 - Create a Named Volume in the Docker Compose File

This method basically combines the 2 steps from the above method. However, I've run into some issues where it does not work correctly depending on the container image and the opts I've given.

A single step, of creating the volume in the docker compose file:
```
version: "3.9"
services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - docker-volume-name:/usr/share/nginx/html
volumes:
  docker-volume-name:
    driver: local
    driver_opts:
      type: nfs
      o: addr=192.168.1.1,rw,vers=4.1
      device: ":/path/to/dir"
```


