# Events, Tickets, Feedback/Review Services Project

## Overview

This mono-repository source code for the implementation and infrastructure as code deployment of the services. Services include a React.js Web frontend application, a Nest.js backend application, and Lambda function.

## Prerequisites

Tools used in the development of this application:

- [AWS](https://aws.amazon.com)
- [Node](https://nodejs.org/)
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Terraform](https://www.terraform.io/downloads.html)
- [Doppler CLI](https://docs.doppler.com/docs)
- [MongoDB](https://www.mongodb.com/)
- [AWS Serverless Application Model (SAM)](https://aws.amazon.com/serverless/sam)

## Installation

To get started an run application local for local development,

- Clone repository

  ```env
  https://github.com/noble-cc/services-scp.git
  ```

- Create an `env.json` file and define URI to MongoDB instances as defined in sample file `env-sample.json`

- Create an `.env` file and define variables as defined in sample file `.env.sample`.

  ```env
  #.env
  AWS_REGION=us-east-1
  FEEDBACKS_SQS_QUEUE_URL=
  EVENTS_MONGO_URI=
  TICKETS_MONGO_URI=
  FEEDBACKS_MONGO_URI=
  ```

  Alternatively, you can setup the doppler cli and configure a development and production environment

- To run lambda function locally:

  ```bash
    $ make tf-sam-start-api ENV=dev
  ```

- To run the Web application and the Feedback service:

  ```bash
    $ docker compose up
  ```

- To deploy lambda functions and create infrastructure based on terraform 

  ```bash
    $ make tf TF_COMMAND=destroy ENV=dev   
  ```