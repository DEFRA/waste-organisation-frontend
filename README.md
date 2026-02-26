# waste-organisation-frontend

[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_waste-organisation-frontend&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=DEFRA_waste-organisation-frontend)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_waste-organisation-frontend&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=DEFRA_waste-organisation-frontend)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_waste-organisation-frontend&metric=coverage)](https://sonarcloud.io/summary/new_code?id=DEFRA_waste-organisation-frontend)

Core delivery platform Node.js Frontend Template.

- [Requirements](#requirements)
  - [Node.js](#nodejs)
- [Server-side Caching](#server-side-caching)
- [Redis](#redis)
- [Local Development](#local-development)
  - [Setup](#setup)
  - [Development](#development)
  - [Production](#production)
  - [Npm scripts](#npm-scripts)
  - [Update dependencies](#update-dependencies)
  - [Formatting](#formatting)
    - [Windows prettier issue](#windows-prettier-issue)
- [Docker](#docker)
  - [Development image](#development-image)
  - [Production image](#production-image)
  - [Docker Compose](#docker-compose)
  - [Dependabot](#dependabot)
  - [SonarCloud](#sonarcloud)
- [Licence](#licence)
  - [About the licence](#about-the-licence)

## Requirements

### Node.js

Please install [Node.js](http://nodejs.org/) `>= v22` and [npm](https://nodejs.org/) `>= v9`. You will find it
easier to use the Node Version Manager [nvm](https://github.com/creationix/nvm)

To use the correct version of Node.js for this application, via nvm:

```bash
cd waste-organisation-frontend
nvm use
```

## Server-side Caching

We use Catbox for server-side caching. By default the service will use CatboxRedis when deployed and CatboxMemory for
local development.
You can override the default behaviour by setting the `SESSION_CACHE_ENGINE` environment variable to either `redis` or
`memory`.

Please note: CatboxMemory (`memory`) is _not_ suitable for production use! The cache will not be shared between each
instance of the service and it will not persist between restarts.

## Redis

Redis is an in-memory key-value store. Every instance of a service has access to the same Redis key-value store similar
to how services might have a database (or MongoDB). All frontend services are given access to a namespaced prefixed that
matches the service name. e.g. `my-service` will have access to everything in Redis that is prefixed with `my-service`.

If your service does not require a session cache to be shared between instances or if you don't require Redis, you can
disable setting `SESSION_CACHE_ENGINE=false` or changing the default value in `src/config/index.js`.

## Proxy

We are using forward-proxy which is set up by default. To make use of this: `import { fetch } from 'undici'` then
because of the `setGlobalDispatcher(new ProxyAgent(proxyUrl))` calls will use the ProxyAgent Dispatcher

If you are not using Wreck, Axios or Undici or a similar http that uses `Request`. Then you may have to provide the
proxy dispatcher:

To add the dispatcher to your own client:

```javascript
import { ProxyAgent } from 'undici'

return await fetch(url, {
  dispatcher: new ProxyAgent({
    uri: proxyUrl,
    keepAliveTimeout: 10,
    keepAliveMaxTimeout: 10
  })
})
```

## Local Development

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

To run the application and all its dependencies (backend, Localstack, Redis, MongoDB, Defra ID stub) in Docker:

```bash
npm run start:docker
```

To run headless (detached mode):

```bash
npm run start:docker -- -d
```

To stop all services:

```bash
npm run stop:docker
```

To run the application outside of Docker (requires backend and infrastructure services to be running separately):

```bash
npm run dev
```

### Production

To mimic the application running in `production` mode locally run:

```bash
npm start
```

### Npm scripts

All available Npm scripts can be seen in [package.json](./package.json)
To view them in your command line run:

```bash
npm run
```

### Update dependencies

To update dependencies use [npm-check-updates](https://github.com/raineorshine/npm-check-updates):

> The following script is a good start. Check out all the options on
> the [npm-check-updates](https://github.com/raineorshine/npm-check-updates)

```bash
ncu --interactive --format group
```

### Formatting

#### Windows prettier issue

If you are having issues with formatting of line breaks on Windows update your global git config by running:

```bash
git config --global core.autocrlf false
```

## Docker

### Development image

> [!TIP]
> For Apple Silicon users, you may need to add `--platform linux/amd64` to the `docker run` command to ensure
> compatibility fEx: `docker build --platform=linux/arm64 --no-cache --tag waste-organisation-frontend`

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

### Docker Compose `include`

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

This approach differs from using multiple `-f` flags (`docker compose -f a.yml -f b.yml`), where all relative paths resolve from the first file's directory, causing incorrect build contexts and volume mounts when projects live in separate directories.

### Dependabot

We have added an example dependabot configuration file to the repository. You can enable it by renaming
the [.github/example.dependabot.yml](.github/example.dependabot.yml) to `.github/dependabot.yml`

### SonarCloud

Instructions for setting up SonarCloud can be found in [sonar-project.properties](./sonar-project.properties).

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
