---
title: Creating a VIN lookup dataset
description: How to create a VIN lookup dataset that could be extended to a self hosted API
date: 2022-12-15
tags:
  - data
layout: layouts/post.njk
---

## Background

This is going to be a pretty short post, but one that I think will come in handy for a lot of people. I was recently working with a dataset and wanting to add vehicle make and model data to a set of taxi cabs in New York City. NHTSA does have a VIN API lookup, however after doing some quick math, it would take 5 days of running a call every second with 50 VINS each to fill the entire 22 million row dataset. Not only would it be work on my end, but would tax the dataset and likely get rate limited quite a bit pushing the time back even further.

## Objective

For my purposes I only want the make and model, however you could do this for more parts of the [VIN to get the entire number translated](https://en.wikipedia.org/wiki/Vehicle_identification_number).

