# waste-organisation-frontend

[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_waste-organisation-frontend&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=DEFRA_waste-organisation-frontend)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_waste-organisation-frontend&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=DEFRA_waste-organisation-frontend)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_waste-organisation-frontend&metric=coverage)](https://sonarcloud.io/summary/new_code?id=DEFRA_waste-organisation-frontend)

The Waste Organisation Frontend is a GDS-compliant Hapi.js application for managing waste receiver
organisations. It provides onboarding, spreadsheet upload, API code management, and search
functionality, using the Gov.uk Design System and Defra ID for authentication.

- [Prerequisites](#prerequisites)
- [Local development](#local-development)
  - [Setup](#setup)
  - [Development](#development)
  - [Production](#production)
  - [Npm scripts](#npm-scripts)
  - [Routes](#routes)
  - [Authentication](#authentication)
  - [Environment variables](#environment-variables)
- [Server-side caching](#server-side-caching)
- [Docker](#docker)
  - [Development image](#development-image)
  - [Production image](#production-image)
  - [Docker Compose](#docker-compose)
  - [Docker Compose include](#docker-compose-include)
- [SonarCloud](#sonarcloud)
- [Dependabot](#dependabot)
- [Licence](#licence)
  - [About the licence](#about-the-licence)

## Prerequisites

For latest minimum versions of Node.js and NPM, see the [package.json](./package.json) 'engines'
property.

- [Node.js](http://nodejs.org/)
- [npm](https://nodejs.org/)
- [Docker](https://www.docker.com/)

You may find it easier to manage Node.js versions using a version manager such
as [nvm](https://github.com/creationix/nvm) or [n](https://www.npmjs.com/package/n). From within the
project folder you can then either run `nvm use` or `n auto` to install the required version.

## Local development

### Setup

The [waste-organisation-backend](https://github.com/DEFRA/waste-organisation-backend) repository must be checked out in a sibling directory next to this repository for Docker Compose to work:

```
parent-directory/
  waste-organisation-backend/
  waste-organisation-frontend/
```

Install application dependencies:

```bash
npm install
```

### Development

To build the application and all its dependencies (backend, Localstack, Redis, MongoDB, Defra ID stub) in Docker:

```bash
npm run build:docker
```

To run the application and all its dependencies in Docker:

```bash
npm run start:docker
```

To run headless (detached mode):

```bash
npm run start:docker -- -d
```

To build and run with a local version of the backend:

```bash
npm run build:docker:local
npm run start:docker:local
```

To stop all services:

```bash
npm run stop:docker
```

To run the application outside of Docker (requires backend and infrastructure services to be running separately):

```bash
npm run dev
```

and hit <http://localhost:3000> in your browser. This will
use [Defra ID stub](https://github.com/DEFRA/cdp-defra-id-stub?tab=readme-ov-file#cdp-defra-id-stub)
for login.

### Production

To mimic the application running in `production` mode locally run:

```bash
npm start
```

### Npm scripts

All available Npm scripts can be seen in [package.json](./package.json).
To view them in your command line run:

```bash
npm run
```

### Routes

The routes for this service are defined in [src/server/router.js](./src/server/router.js).

### Authentication

For authentication when running locally, there are 2 options:

#### Defra ID stub

The out-of-the-box config will use
the [cdp-defra-id-stub](https://github.com/DEFRA/cdp-defra-id-stub). If you run this with docker
compose (see section below) you will also get an instance of Redis, which can be used for session
caching.

#### Real Defra ID

To use real Defra ID authentication, override the `AUTH_DEFRA_ID_*` environment variables
in [config.js](./src/config/config.js) with your Defra ID tenant credentials.

### Environment variables

For most local development, you shouldn't need to override any of the env var defaults that are
in [config.js](./src/config/config.js).

## Server-side caching

We use Catbox for server-side caching. By default the service will use CatboxRedis when deployed and
CatboxMemory for local development. You can override the default behaviour by setting the
`SESSION_CACHE_ENGINE` environment variable to either `redis` or `memory`.

Please note: CatboxMemory (`memory`) is _not_ suitable for production use! The cache will not be
shared between each instance of the service and it will not persist between restarts.

## Docker

Ensure you have run `npm install` before running any Docker commands.

> [!TIP]
> For Apple Silicon users, you may need to add `--platform linux/amd64` to the `docker run` command
> to ensure compatibility.

### Development image

Build:

```bash
docker build --target development --no-cache --tag waste-organisation-frontend:development .
```

Run:

```bash
docker run -p 3000:3000 waste-organisation-frontend:development
```

### Production image

Build:

```bash
docker build --no-cache --tag waste-organisation-frontend .
```

Run:

```bash
docker run -p 3000:3000 waste-organisation-frontend
```

### Docker Compose

A local environment with:

- Localstack for AWS services (S3, SQS)
- Redis
- MongoDB
- waste-organisation-backend (and its sibling services)
- cdp-defra-id-stub (OIDC authentication stub)
- cdp-uploader (file upload service)
- This service

```bash
docker compose up --build -d
```

### Docker Compose include

The frontend's `compose.yml` uses the Docker Compose [`include`](https://docs.docker.com/compose/how-tos/multiple-compose-files/include/) directive to pull in the backend's `compose.yml`:

```yaml
include:
  - path: ../waste-organisation-backend/compose.yml
```

This means infrastructure services (Localstack, Redis, MongoDB) and backend services are defined once in the backend's `compose.yml` and reused by the frontend. The frontend's `compose.yml` only defines services specific to the frontend (cdp-defra-id-stub, cdp-uploader, waste-organisation-frontend).

Key benefits:

- No duplicated service definitions across projects
- Each compose file resolves relative paths (build contexts, volumes, env files) from its own directory
- Running `docker compose up` from the frontend directory starts everything
- The backend can still be run independently with its own `npm run start:docker`

## SonarCloud

Instructions for setting up SonarCloud can be found
in [sonar-project.properties](./sonar-project.properties).

## Dependabot

Dependabot automatically creates pull requests to update dependencies.

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this
information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery
Office (HMSO) to enable information providers in the public sector to license the use and re-use of
their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few
conditions.
