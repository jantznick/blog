---
layout: layouts/page.njk
title: Triathlon
templateClass: tmpl-page
key: triathlon
eleventyNavigation:
  key: Triathlon
  order: 4
---

I am a person that writes stuff.


<ul>
{%- for race in races[2008] %}
  <li>{{ race.raceName }}</li>
{%- endfor %}
</ul>
