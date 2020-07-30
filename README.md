# Booking Microservice

This is a mock booking microservice, with NodeJS Typescript and Express Framework.

## Requirement

### Node

- #### Node Installation Guide

  Download and install from [official Node.js website](https://nodejs.org/)

If the installation was successful, you should be able to run the following command.

      $ node --version
      v8.11.3

      $ npm --version
      6.1.0

### MongoDB

- #### MongodDB Installation Guide

  Downlaod and install from [MongoDB website - Community Server](https://www.mongodb.com/try/download/community) and follow the setup guid

  Mongo URI is needed under process.env.DB_URI in src/db/index.ts

### Other Service

- #### Payment Service

  Install [Payment Service](https://github.com/Kurox5761/payment_microservice) too and start it if running on local.

## Install

    $ git clone https://github.com/Kurox5761/booking_microservice
    $ cd booking_microservice
    $ npm install

## Running the project

    $ npm start

## Build for production

    $npm run build

## Testing & Coverage

Mocha test

    $npm test

Coverage

    $npm run coverage

## API

### 1. **POST** /booking

#### Description

Endpoint for creating booking

#### Body

    {
        bookingInfo: {
            userId: string,
            time: {
                start: string,
                end: string,
            }
        },
        paymentInfo[Optional]: {
            ...[get it from payment/1/response]
        }
    }

#### Response

Using **payment/1/response** will fail the payment
Using **payment/2/response** will success the payment

    {
        id,
        payment_status[Optional]
    }

### 2. **PUT** /booking/:id/payment

#### Description

Endpoint processing particular booking's payment. paymentInfo is required.

#### Body

    {
        paymentInfo: {
            ...[get it from payment/1/response]
        }
    }

#### Response

Using **payment/1/response** will fail the payment
Using **payment/2/response** will success the payment

    {
        id,
        payment_status[Optional]
    }

### 3. **Get** /bookings

#### Description

Endpoint get all the bookings

#### Response

    [{
        _id,
        bookingStart,
        bookingEnd,
        createdAt,
        state,
        __v
    }]
