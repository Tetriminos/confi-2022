# Confi

A comfy conference booking tool.

## Prerequisites

Make sure you have Node.js v16.14 or higher installed.

Docker and docker-compose are not necessary, but you will not be able to run e2e tests without them.

Configure an env file at `.env`, for example:
```dotenv
DB_HOST=localhost
DB_PORT=5432
DB_USER=confi
DB_PASS=confi
DB_NAME=confi
ADMIN_USERNAME=admin
ADMIN_PASSWORD=test
JWT_SECRET=test
JWT_EXPIRY=1h
MAIL_HOST=
MAIL_PORT=587
MAIL_USER=
MAIL_PASS=
MAIL_SECURE=false
NODE_ENV=development
PORT=3000
```

## Installation

```bash
$ npm install
```

## Running the app

If you don't have a local postgres instance running, you can spin one up using docker-compose:
```bash
$ docker-compose up -d postgres
```

To run the migrations and seeds:
```bash
$ npm run typeorm:migration:run
$ npm run typeorm:seed
```

To revert the last migration:
```bash
$ npm run typeorm:migration:revert
```

To run the app:
```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov

# e2e tests (Docker and docker-compose are required)
$ npm run test:e2e:docker
```

## API Docs

Api docs are automatically generated, and can be viewed via swagger.

They are hosted on `/api`. For example, during development: `http://localhost:3000/api`.

Routes other than `create` and `admin/login` are protected with bearer auth:
Use `/admin/login` with the username and password from your env file, and copy the `access_token`.
Use it to authorize Swagger via the `Authorize button`.

## Example production app running in Docker

There is an example `docker-compose.yml` file to showcase running the app in a Dockerized environment.

To run it:
```shell
$ docker-compose up -d
```

## Dependencies

I've used `@nest-modules/mailer` for easier integration of e-mail into the app.
The project is actively maintained and has a good number of collaborators.

Other than that, all packages used are encouraged by the NestJS community and documentation,
so another `faker` situation shouldn't befall these.

## Possible improvements

* Maximum number of bookings per conference, so it won't get vastly overbooked
* Concept of a non-admin user, where that user can book a conference with his account
* Some form of rate-limiting, so nobody runs a script registering every possible e-mail
* CORS for the eventual client-app
