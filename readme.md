# Bulk OpenAI API Handler

`bulk-openai-api` is a Node.js package that simplifies making batch requests to the OpenAI API while using a local SQLite database to store responses, preventing duplicate requests and saving costs. With this package, developers can efficiently make multiple requests to the OpenAI API's chat and completion models, and the results are stored in a local SQLite database. The database can be queried or exported to a CSV file for further analysis.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Initialization](#initialization)
  - [Making Requests](#making-requests)
  - [Database Operations](#database-operations)
- [Examples](#examples)
- [Contributing](#contributing)
- [Limitation](#limitation)

## Installation

Install the package using npm:

```sh
npm install bulk-openai-api
```

## Usage

### Initialization

First, import the package and create a new instance of `BulkOpenAIApi`, providing your OpenAI API key as an argument:

```javascript
const { BulkOpenAIApi } = require('bulk-openai-api');

const apiKey = 'your-openai-api-key';
const apiHandler = new BulkOpenAIApi(apiKey);
```

You can also provide a custom SQLite database file path and specify whether to recreate the database:

```javascript
const apiHandler = new BulkOpenAIApi(apiKey, 'custom-db-path.db', true);
```

### Making Requests

To make multiple requests to the OpenAI API, call the `makeNRequests` function with an array of prompts and request options:

```javascript
const prompts = ['What is the capital of France?', 'Translate "Hello" to Spanish.'];
const requestOptions = {
  model: 'gpt-3.5-turbo',
  maxTokens: 10,
};

apiHandler.makeNRequests(prompts, requestOptions).then((responses) => {
  console.log(responses);
});
```

### Database Operations

The package automatically stores the API responses in the SQLite database. You can export the stored data to a CSV file by calling the `writeDataToCsv` function:

```javascript
apiHandler.writeDataToCsv('responses.csv').then(() => {
  console.log('Data exported to responses.csv');
});
```

## Examples

Here's an example of using the package to make multiple requests and export the data to a CSV file:

```javascript
const { BulkOpenAIApi } = require('bulk-openai-api');

const apiKey = 'your-openai-api-key';
const apiHandler = new BulkOpenAIApi(apiKey);

const prompts = ['What is the capital of France?', 'Translate "Hello" to Spanish.'];
const requestOptions = {
  model: 'gpt-3.5-turbo',
  maxTokens: 10,
};

apiHandler.makeNRequests(prompts, requestOptions).then((responses) => {
  console.log(responses);
  apiHandler.writeDataToCsv('responses.csv').then(() => {
    console.log('Data exported to responses.csv');
  });
});
```

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests to improve the package, fix bugs, or add new features.

## Limitation

Currently this package works for only chat completion api. I am working on to extend it to other models.