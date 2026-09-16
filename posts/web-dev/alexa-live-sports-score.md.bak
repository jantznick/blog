---
title: Adding Live Sports Scores to a Voice Assistant using SerpAPI and an LLM
description: Using SerpAPI to give self hosted voice assistants the ability to answer questions based on live sports scores or other real time information
date: 2025-03-20
tags: web-dev
layout: layouts/post.njk
---

## Background

In 2023 Home Assistant focused their efforts on the ['Year of the Voice'](https://www.home-assistant.io/blog/2022/12/20/year-of-voice/) in an attempt to bring more and better voice control to the already great Home Assistant platform. Combined with the ability to use LLMs in integration with their voice assistant this gives some great features for making a self hosted voice assistant that can do a lot with minimal custom coding.

One major limitation of many LLMs is they're only as good as their knowledge cutoff. Which makes answering up to date or even questions about live events impossible. A growing number have the ability to search the web and use that data, but right now the voice assistant integrations with them limit that.

I often ask my Alexa questions around the current score of my favorite sports teams or when their next game is, and getting an LLM to answer this question accurately proves to be a challenge. Today I'll show you how I managed to solve this problem using a few simple Home Assistant scripts.

## Setup

The most basic setup for this needs the following tools:

- A [SerpAPI](https://serpapi.com/) account - We'll be using this to get nicely formatted data back from google search results
- A [Home Assistant instance with voice control](https://www.home-assistant.io/voice_control/) - This will be the host for the voice assistant brains
    -  I've also integrated a custom text input helper and custom [rest command](https://www.home-assistant.io/integrations/rest_command/) script which I'll describe below
- Some sort of LLM - We need to integrate an LLM into our Home Assistant for easy parsing of the API data from SerpAPI. I will be using the OpenAI API for this, but you can use any that integrates with Home Assistant

## Goal and Method

My end goal for this will be to have a locally hosted voice assistant that can answer questions about the current score and game status of any sports teams I ask it about.

To do this I will use the [Sports Results](https://serpapi.com/sports-results) card API from SerpAPI to gather the latest sports results and feed it into my LLM and have it return a natural language answer to my original question.


## Idea Validation

Before starting a project I like to come up with an idea and validate that it will work by going through each step manually. I've come up with the following flowchart of how this will work.

![](https://me.nickjantz.com/img/serpapi-flow-chart.png)

1. The first step is, given a question, we need to return a google search term that will return a sports card showing the answer to our question. This is pretty easy using an LLM and a basic prompt:

![](https://me.nickjantz.com/img/first-test-prompt.png)

2. Take the previous search keyword and feed it into the SerpAPI sports results endpoint. We should end up with a URL like this:

`https://serpapi.com/search.json?q=Real+Madrid+Score&api_key=YOUR_API_KEY`

When you make the GET call to this URL your response result will be a large json object with everything from the search result page. The key portion of this data is in the 'sports_results' key. [You can see a sample search result here.](https://serpapi.com/playground?q=Manchester+United+F.C.&location=austin%2C+texas%2C+united+states&gl=us&hl=en&highlight=sports_results)

3. Following this you can feed that data into another LLM and with a bit of prompt magic you will get a natural language sounding result to your original question.

![](https://me.nickjantz.com/img/result-prompt.png)

You can choose exactly how much data you want to feed into the prompt, however for my purposes I wanted to include as much as possible so I chose to send the entire 'sports_results' object. I found that when I would try to limit it sometimes the answers would come back weird as the LLM did not have information such as who was the home and away team. When it has all the data it is usually able to infer things like home and away team based on which stadium the game is being played at. This is a perfect example of why feeding this to an LLM makes a lot of sense, it already has a wealth of knowledge at it's disposal to add additional context to it's understanding of the raw JSON data.


### Looks like everything is working as we'd like, minus some prompt refining, we can go ahead and make a home assistant script that will handle the above question.

## Writing the Home Assistant Integration 

Now comes the fun part, integrating it into home assistant. The following instructions assume the following:
1. You have home assistant with a voice assistant active
2. Your voice assistant has an integration with an LLM
    - Unfortunately there's no tutorial on how to do this, however you can [follow this tutorial](https://www.home-assistant.io/voice_control/assist_create_open_ai_personality/) on how to create a personality for you voice assistant and leave out step 4 about modifying the initial prompt to allow for you voice assistant to integrate with an LLM.
3. You have some method to hand off your SerpAPI key to the script that makes the actual API call. I've chosen to use a [input text helper](https://www.home-assistant.io/integrations/input_text/) however, you can chose to hardcode it into your script or anything else you feel comfortable with

### Script Title and Description
One thing a lot of people don't realize is that you don't have to write any sort of special commands sentance or anything like that to get a voice assistant to actually trigger a custom script in home assistant. As long as the script is exposed to the voice assistant and it is descriptive enough, the assistant will know to trigger it. For this case, I've decided to pack my description and title with keywords:

```
alias: Current Sports Scores and Schedule Script
description: >-
  This script uses live data to get current sports scores and schedule
  information for a variety of sports
```

The script needs a default field that is going to get passed as the question:
```
fields:
  question:
    selector:
      text: null
    name: Question
    required: true
    default: What is the score of the cubs game?
```
The default value can be left blank, however I use it as a fall back to ensure the LLM gets some sort of valid data and doesn't end up halluclinating with nothing that results in a strange sentence getting read back to the user.

### Script Steps:
Following the exact same steps as above, just in a yaml that home assistant understands.

**1. Get a search term using an LLM:**
```
  - action: conversation.process
    metadata: {}
    data:
      agent_id: conversation.chatgpt
      text: >
        Given the following question, return a team name that you could google
        to get the answer to the question. This info will be fed into an API, so
        only give the text of the team name, no other info or text

        Example Question: What is the score of the cubs game?

        Example Output: Chicago Cubs Score

        Real Question: {{ question }}
    response_variable: serp_keyword
```

This just creates a standalone chatgpt process(my LLM for this example) and feeds it the prompt we used above. It then saves the response variable as `serp_keyword` so it's accessible to the rest of the script.

**2. Hit the proper SerpAPI endpoint for that search term:** 
```
  - action: rest_command.fetch_sports_scores
    data:
      team: "{{ serp_keyword.response.speech.plain.speech }}" 
    response_variable: serp_data
```

For this step it uses a custom rest command script that accepts the value of the serp_keyword as a parameter to fill into the right API endpoint.  

I've also added the following script to my home assistant config file:
```
rest_command:
  fetch_sports_scores:
    url: "https://serpapi.com/search.json?q={% raw %}{{ team }}&api_key={{ states('input_text.serpapi_api_key') }}{% endraw %}"
    method: "GET"
    timeout: 30
    headers:
      Content-Type: "application/json"
```

**3. Ask the LLM to give me an answer to my question based on the data:**

```
  - action: conversation.process
    metadata: {}
    data:
      agent_id: conversation.chatgpt
      text: >
        Given the following data, please provide a relevant answer to the
        question '{{ question }}' include any relevant information, such as
        score if the game is happening or future and/or past games if there's
        not one happening now. Data: {{ serp_data.content.sports_results }}
    response_variable: answer
  - stop: Finished
    response_variable: answer
```

Again this time, just starting a standalone chatgpt process that asks for the answer to the given question. The only home assistant extra is to put a hard stop at the end of the script and pass the response_variable to the voice assistant.

### Done!

Just wrap the script in the sequence tag and you'll have a complete script that should look like this:
```
alias: Current Sports Scores and Schedule Script
description: >-
  This script uses live data to get current sports scores and schedule
  information for a variety of sports
fields:
  question:
    selector:
      text: null
    name: Question
    required: true
    default: What is the score of the cubs game?
sequence:
  - action: conversation.process
    metadata: {}
    data:
      agent_id: conversation.chatgpt
      text: >
        Given the following question, return a team name that you could google
        to get the answer to the question. This info will be fed into an API, so
        only give the text of the team name, no other info or text

        Example Question: What is the score of the cubs game?

        Example Output: Chicago Cubs Score

        Real Question: {{ question }}
    response_variable: serp_keyword
  - action: rest_command.fetch_sports_scores
    data:
      team: "{{ serp_keyword.response.speech.plain.speech }}"
    response_variable: serp_data
  - action: conversation.process
    metadata: {}
    data:
      agent_id: conversation.chatgpt
      text: >
        Given the following data, please provide a relevant answer to the
        question '{{ question }}' include any relevant information, such as
        score if the game is happening or future and/or past games if there's
        not one happening now. Data: {{ serp_data.content.sports_results }}
    response_variable: answer
  - stop: Finished
    response_variable: answer
```