---
title: Introduction to Pandas
description: A brief introduction to reading csv datasets and getting basic info about the data set using pandas
date: 2025-01-01
tags:
  - data-analysis
layout: layouts/post.njk
---
# A Comprehensive Introduction to Pandas: Loading Data, Exploring DataFrames, and Understanding Data Types

In this blog post we'll learn about loading data into a Pandas **DataFrame**, to exploring its structure, and finally understanding the underlying data types. This post will be perfect for beginners looking to grasp the foundation of Pandas.

---

## What Are Pandas and DataFrames?

Pandas is a Python library designed for data manipulation and analysis. At the core of Pandas are its two data structures:
1. **DataFrames**: Two-dimensional tabular data structures (like spreadsheets) consisting of columns and rows.
2. **Series**: One-dimensional arrays.

A DataFrame, the focus of this post, is like an enhanced spreadsheet in Python, making it an essential tool for data analytics and handling datasets.

### Basic Features of a Pandas DataFrame:
- Stored as a 2D structure with labeled rows and columns.
- Supports heterogeneous data types (e.g., numeric, text, datetime).
- Comes packed with **hundreds of built-in methods** for data cleaning and analysis.

---

## Step 1: Loading Data with Pandas `read_csv`

The journey begins with importing data into a Pandas DataFrame. The `read_csv()` function is the foundation for reading tabular data stored in CSV (Comma-Separated Values) files. You’ll use this method frequently, as it’s often the first step in any analysis workflow.

### Example: Importing Datasets
Let's work with two sample datasets:
1. **States Dataset** (`states.csv`): A small dataset containing U.S. states, abbreviations, and codes.
2. **House Sales Dataset** (`HouseSales.csv`): A large dataset with home sales data from King County, Washington, featuring information like price, bedrooms, bathrooms, and square footage.

```python
# Step 1: Import the Pandas library
import pandas as pd

# Step 2: Read the datasets into DataFrames
states = pd.read_csv('data/states.csv')
houses = pd.read_csv('data/HouseSales.csv')

# Step 3: Preview the data (optional)
print(states.head())  # View the first 5 rows of the smaller dataset
print(houses.head())  # View the first 5 rows of the larger dataset
```

### The Power of `read_csv()`
- Automatically infers data types: Pandas tries to determine if a column contains numbers, text, or dates.
- Handles large and small datasets gracefully: Even with millions of rows, Pandas stores the data efficiently in memory.
- Extensive options: `read_csv()` supports custom delimiters, encodings, missing value handling, and more.

Pro Tip: Always assign a DataFrame to a variable (e.g., `states`, `houses`) to reuse it without reloading the file each time.

---

## Step 2: Exploring the Structure of a DataFrame

Once you’ve loaded your dataset, the next step is understanding its structure. Pandas provides several built-in methods to inspect and analyze your DataFrame.

### Inspecting Columns with `.columns`
To see all the columns in your DataFrame, use the `.columns` property. This is especially helpful for large datasets with many columns.

```python
# View column names in the houses DataFrame
print(houses.columns)
```

#### Example Output:
```
Index(['id', 'date', 'price', 'bedrooms', 'bathrooms', ..., 'view', 'grade', 'sqft_above'], dtype='object')
```
If your dataset contains a lot of columns, Pandas truncates the output with `...`, but all columns are still accessible.

For smaller datasets, such as `states`, the output will show all column names:
```python
# View column names in the states DataFrame
print(states.columns)  # Output: ['state', 'abbreviation', 'code']
```

---

### Checking the Shape and Size
To understand the dimensions of your DataFrame, use the `.shape` and `.size` properties:
- **`shape`**: Returns `(number of rows, number of columns)`.
- **`size`**: Returns the total number of elements (rows × columns).

```python
# Get the number of rows and columns
print(houses.shape)  # Output: (21613, 21)

# Get the total number of elements
print(houses.size)  # Output: 453873
```

---

### Subsetting Rows with `.head()` and `.tail()`
For quick previews of your data:
- **`.head()`**: Returns the first n rows (default = 5).
- **`.tail()`**: Returns the last n rows (default = 5).

```python
# Preview the top rows
print(houses.head())  # First 5 rows
print(houses.head(10))  # First 10 rows

# Preview the bottom rows
print(houses.tail())  # Last 5 rows
print(houses.tail(10))  # Last 10 rows
```

#### Saving Results
Both methods return **new DataFrames**. For example:
```python
first_10_houses = houses.head(10)
last_10_houses = houses.tail(10)
```

---

### Adjusting Display Options
By default, Pandas truncates outputs for larger DataFrames. If you want to control how many rows are displayed, modify the display options:

```python
pd.options.display.min_rows = 15  # Display at least 15 rows
pd.options.display.max_columns = 10  # Display up to 10 columns
```

These settings don’t alter your DataFrame, they only change how it appears in the terminal or Jupyter Notebook.

---

## Step 3: Understanding Data Types in a DataFrame

Each column in a DataFrame has a **data type** that determines how it is stored and what operations can be performed on it.

### Inspecting Data Types with `.info()`
Use the `.info()` method to get a comprehensive overview of your DataFrame:
- Index information.
- Column names.
- Non-null counts (useful for identifying missing values).
- Data types (`dtype`) for each column.
- Memory usage of the DataFrame.

```python
# View information about the houses DataFrame
houses.info()
```

#### Example Output:
```
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 21613 entries, 0 to 21612
Data columns (total 21 columns):
 #   Column       Non-Null Count  Dtype  
---  ------       --------------  -----  
 0   id           21613 non-null int64  
 1   date         21613 non-null object 
 2   price        21613 non-null float64
 ...                              ...
dtypes: float64(2), int64(14), object(5)
memory usage: 3.5 MB
```

---

### Viewing Data Types with `.dtypes`
For a simpler output, use the `.dtypes` property:

```python
# Get data types for each column
print(houses.dtypes)
```

---

### Integers, Floats, and Objects in Pandas
Some columns to note in the `houses` dataset:
- **`int64`:** Integer types (e.g., `bedrooms`, `id`).
- **`float64`:** Floating-point (decimals) for columns like `price` or `bathrooms`.
- **`object`:** Catch-all for text data, dates, or unrecognized types.

If the data type isn’t ideal (e.g., storing dates as `object`), you can convert columns to more specific types like `datetime64` or `category` for memory efficiency.

---
