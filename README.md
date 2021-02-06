# Serverless Todo App

Simple serverless todo application

## Installation

You will need the following packages installed locally,

- AWS CLI
- Node JS (8 or higher)
- Yarn

## Local Development

Before starting local development you will need to run a couple of commands in separate bash windows,

```bash
yarn global add serverless
yarn install
serverless dynamodb install
```

This will install DynamoDB locally.

Note: If you're running `aws` for the first time, run `aws configure` once to avoid errors.

You will need to setup environment variables, to do this copy the `.env.dist.json` to `.env.json`.


You can start the local DynamoDB, migrate tables and simulate lambda and API endpoints locally using 
the following command.

```bash
serverless offline start
```
Open a browser and go to the url [http://localhost:8008/shell](http://localhost:8008/shell) to access the web shell for dynamodb local.

See more information on [DynamoDB Local](https://www.npmjs.com/package/serverless-dynamodb-local) advanced options and configuration.

#### Local Endpoints

##### Lists
`POST create list -`
[http://localhost:3000/dev/list/create](http://localhost:3000/dev/list/create)

`POST delete list and tasks -`
[http://localhost:3000/dev/list/delete](http://localhost:3000/dev/list/delete)

`POST Get list and tasks -`
[http://localhost:3000/dev/list](http://localhost:3000/dev/list)

`POST update list -`
[http://localhost:3000/dev/list/update](http://localhost:3000/dev/list/update)


##### Tasks
`POST create task -`
[http://localhost:3000/dev/task/create](http://localhost:3000/dev/task/create)

`POST delete task -`
[http://localhost:3000/dev/task/delete](http://localhost:3000/dev/task/delete)

`POST Get task -`
[http://localhost:3000/dev/task](http://localhost:3000/dev/task)

`POST update task -`
[http://localhost:3000/dev/task/update](http://localhost:3000/dev/task/update)


## Testing

Tests are located in the `tests` folder an can be invoked by running `yarn unit-test` and `yarn feature-test`. These 
tests will invoke the defined  actions in a wrapper, where the response can then be tested.
