# Bulk OpenAI API

`bulk-openai-api` is a Node.js package that simplifies making batch requests to the OpenAI API while using a local SQLite database to store responses, preventing duplicate requests and saving costs. With this package, developers can efficiently make multiple requests to the OpenAI API's [chat](https://platform.openai.com/docs/api-reference/chat) and [completion](https://platform.openai.com/docs/api-reference/completions) models, and the results are stored in a local SQLite database. The database can be queried or exported to a CSV file for further analysis.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Initialization](#initialization)
  - [Making Requests](#making-requests)
  - [Database Operations](#database-operations)
- [Examples](#examples)
- [Why You Need This?](#why-you-need-this)
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

The package supports both chat completion and text completion. You can specify the `promptType` in the request options:

```javascript
const requestOptions = {
  promptType: 'completion',
  model: 'text-davinci-003',
  maxTokens: 10,
};
```

### Database Operations

The package exposes a method `writeDataToCsv` that can export the stored data in the sqlite db to a CSV file.This function only works when database options are passed in the BulkOpenAIApi constructor.

```javascript
apiHandler.writeDataToCsv('responses.csv').then(() => {
  console.log('Data exported to responses.csv');
});
```

### Available params

makeNRequests takes in 2 params - 

2. `RequestOptions` object when making requests using the `BulkOpenAIApi` package. [Limitation] These params will be passed to every request being made.


| Parameter            | Type    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|----------------------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `prompts`             | Array of string [required]  | this is a required array and makes the core of the request object.                                                                                                             
| `RequestOptions`             | Object described below [optional]  | these are additional options that can be passed to the requests. But these will be part of every request we make from the openai library. This is the limitation of this package at the moment.

### RequestOptions object
These are the request options that I tested for my use case. Ideally it should support other params that are given on  [chat](https://platform.openai.com/docs/api-reference/chat) and [completion](https://platform.openai.com/docs/api-reference/completions) model pages. 
<!-- pagebreak -->

Also take a look at this [page](https://platform.openai.com/docs/models/model-endpoint-compatibility) for model endpoint compatibility and make sure you are passing right models for either chat or completion.
##### Disclaimer
Using other parameters may break the database writing and csv writing 
operations. Try those on your own risk!

| Parameter            | Type    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|----------------------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `promptType`         | String  | The type of completion request you want to make. Use `"completion"` for text completion models or leave it unset for chat completion models.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `model`              | String  | The name of the model you want to use for your request. For chat completion models, the default is `"gpt-3.5-turbo"`. For text completion models, the default is `"text-davinci-003"`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `maxTokens`          | Number  | The maximum number of tokens (words or word pieces) that the model should generate in its response. A lower value will result in shorter responses.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `temperature`        | Number  | Controls the randomness of the generated output. A higher value (e.g., 1) will make the output more diverse, while a lower value (e.g., 0) will make it more focused and deterministic.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |


## Examples

Here's an example of using the package to make multiple requests to the chat completion and text completion models, and export the data to a CSV file:

```javascript
const { BulkOpenAIApi } = require('bulk-openai-api');

const apiKey = 'your-openai-api-key';
const apiHandler = new BulkOpenAIApi(apiKey,"test.db",true);

const prompts = ['What is the capital of France?', 'Translate "Hello" to Spanish.'];
const chatCompletionOptions = {
  model: 'gpt-3.5-turbo',
  maxTokens: 10,
};

const textCompletionOptions = {
  promptType: 'completion',
  model: 'text-davinci-003',
  maxTokens: 10,
};

(async () => {
  const chatCompletionResponses = await apiHandler.makeNRequests(prompts, chatCompletionOptions);
  console.log('Chat Completion Responses:');
  console.log(chatCompletionResponses);

  const textCompletionResponses = await apiHandler.makeNRequests(prompts, textCompletionOptions);
  console.log('Text Completion Responses:');
  console.log(textCompletionResponses);


  // Note :: writeDataToCsv only works when the database options are passed to the BulkOpenAIApi constructor.
  apiHandler.writeDataToCsv('responses.csv').then(() => {
    console.log('Data exported to responses.csv');
  });
  })();
  ```

Another example could look like below with extra params - 
```javascript
const { BulkOpenAIApi } = require('bulk-openai-api');

const apiKey = 'your-openai-api-key';
const apiHandler = new BulkOpenAIApi(apiKey);

const prompts = [
    'Write a post on Super Mario',
    'Write a post on Prince of Persia',
  ];
const chatCompletionOptions = {
  model: 'gpt-3.5-turbo',
  maxTokens: 1000,
  temperature: 1,
};


(async () => {
  const chatCompletionResponses = await apiHandler.makeNRequests(prompts, chatCompletionOptions);
    console.log('Chat Completion Responses:');
    console.log(chatCompletionResponses);
  })();
  ```


## Why You Need This?

The `bulk-openai-api` package is designed to address several challenges that I personally faced working with openAI apis:

1. **Batch Processing**: Saving time is my biggest motivation behind this. This supports sending out multiple requests at a time to open ai servers and write responses to the sqlite database as they come. Reason for introducing an sqlite database is to handle create operation with better consistency than directly writing the responses to a csv file or a json file.

2. **Cost Optimization**: Another concern that I want to tackle is to avoid same api calls again and again which will result in huge bills if you don't set any limits on your account. This makes sure that any response that is coming is getting saved so that you can optimize your text generation. Happy generation!

3. **Data Management**: Keeping track of API responses and their associated prompts can be cumbersome. The package's built-in SQLite database offers an easy way to store and manage responses. Furthermore, the package includes functionality to export the stored data as a CSV file, simplifying data analysis and sharing.

4. **Supports Both Chat and Text Completion Models**: This package targets both chat and text completion models.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests [here](https://github.com/muditjuneja/bulk-openai-api) to improve the package, fix bugs, or add new features.

## Limitation

This package currently supports only chat and text completion models and is not intended for use in production environments and may have scalability issues.
