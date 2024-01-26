---
title: Protecting a Flask API with Supabase
description: Protecting a Flask API with Supabase
date: 2023-03-02
tags:
layout: layouts/post.njk
---

## Background

I am working on a side project that involves user authorization and authentication. In the past I have used [PassportJS](http://www.passportjs.org/). While this has been great in the past there's some scenarios where it isn't the greatest. In this case I am using the OpenAI API which I've implemented in Python. Using Passport would require NodeJS and I don't want to cross the two languages as part of my backend.

For this case I've decided to use [Supabase](https://supabase.com/). It's an alternative to Firebase, and while it has grown to have a lot of features, what I'm interested in is using it as an auth provider. The Python library for it is only community supported, but it does have enough features to use as a basic auth wrapper. Mixed with some features of flask it will work just fine for my needs.