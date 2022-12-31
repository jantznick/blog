---
title: Learning with Large Datasets
description: 
date: 2022-12-30
tags:
  - data
layout: layouts/post.njk
---

In my learning data science I like to work with publicly available datasets. There are quite a few places to get this, but one that I keep going back to are some of the open data sets from [Chicago](https://data.cityofchicago.org/) and [New York](https://opendata.cityofnewyork.us/). They just have great documentation and easy to download sets of data. The problem is they're often on the larger size and can take up a lot of computing resources for something like a Jupyter notebook where you may be working a lot when first learning.

Luckily, you can go ahead and make mini versions of these datasets and then use them for any exploratory purposes before running full scripts on them, if you so choose. Here I will show you my approach to doing that. I realize there's ways to do this possibly by doing something like `ECHO head dataset.json > mini-dataset.json` but for purposes of learning I wanted to test my python skills.

My goal was to take all my data files, stored in a single folder and make versions of them starting with mini-*** to make them easier to work with. Maybe only 100-200 rows long.

Since I'm doing this on all my data files I need to first gather them all in a list to loop through them. Coming from the web dev/JS world I am absolutely in love with list comprehensions.
```python
import os

files = [file for file in os.listdir() if file.endswith('.csv')]
```

From there I will read through each file
```python
for file in files:
    ...
```
Read the file into a pandas data frame
```python
read_file = pd.read_csv(f"data/{file}")
```
Write the first 150 lines into my new file
```python
read_file[:150].to_csv(f"mini-{file}")
```

Final file looks like
```python
import os
import pandas as pd

files = [file for file in os.listdir() if file.endswith('.csv')]

for file in files:
  read_file = pd.read_csv(f"data/{file}")
  read_file[:150].to_csv(f"mini-{file}")
```