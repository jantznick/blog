---
layout: layouts/page.njk
title: Triathlon
templateClass: tmpl-page
key: triathlon
eleventyNavigation:
  key: Triathlon
  order: 4
---

I am a person that writes stuff about Triathlons.

{% for key, value in races %}
<h2>{{ key }}</h2>
<ul>
{%- for race in value %}
  <li>{{ race.raceName }}</li>
{%- endfor %}
</ul>
{% endfor %}

