import convict from 'convict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import convictFormatWithValidator from 'convict-format-with-validator'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const fourHoursMs = 14400000
const oneWeekMs = 604800000

const isProduction = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'test'
const isDevelopment = process.env.NODE_ENV === 'development'

export const cacheControlNoStore = {
  privacy: 'default',
  otherwise: 'no-store'
}

convict.addFormats(convictFormatWithValidator)

convict.addFormat({
  name: 'space-separated-string',
  validate: (val) => typeof val === 'string',
  coerce: (val) => val?.split(/ +/).filter((s) => s)
})

export const config = convict({
  backendApi: {
    url: {
      doc: 'The url of the Backend API service.',
      format: String,
      nullable: false,
      default: 'http://localhost/TODO',
      env: 'BACKEND_API'
    },
    presharedKey: {
      doc: 'The preshared key for the Backend API service.',
      format: String,
      nullable: false,
      default: 'abc123',
      env: 'BACKEND_API_PRESHARED_KEY'
    }
  },
  fileUpload: {
    url: {
      doc: 'The url of the File Upload API service.',
      format: String,
      nullable: false,
      default: 'http://localhost:7337',
      env: 'FILE_UPLOAD_SERVICE_URL'
    },
    bucketName: {
      doc: 'The S3 bucket name the uploaded file will be written to.',
      format: String,
      nullable: false,
      default: 'my-bucket',
      env: 'FILE_UPLOAD_S3_BUCKET'
    }
  },
  links: {
    startPage: {
      doc: 'Link to guidance start page',
      format: String,
      default: '/start-page',
      env: 'LINK-GUIDANCE-START-PAGE'
    },
    feedback: {
      doc: 'Link to feedback page',
      format: String,
      default: '/start-page',
      env: 'LINK-FEEDBACK-PAGE'
    }
  },
  serviceVersion: {
    doc: 'The service version, this variable is injected into your docker container in CDP environments',
    format: String,
    nullable: true,
    default: null,
    env: 'SERVICE_VERSION'
  },
  host: {
    doc: 'The IP address to bind',
    format: 'ipaddress',
    default: '0.0.0.0',
    env: 'HOST'
  },
  appBaseUrl: {
    doc: 'Application base URL for after we signIn',
    format: String,
    default: 'http://localhost:3000',
    env: 'APP_BASE_URL'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3000,
    env: 'PORT'
  },
  staticCacheTimeout: {
    doc: 'Static cache timeout in milliseconds',
    format: Number,
    default: oneWeekMs,
    env: 'STATIC_CACHE_TIMEOUT'
  },
  serviceName: {
    doc: 'Applications Service Name',
    format: String,
    default: 'Report receipt of waste'
  },
  root: {
    doc: 'Project root',
    format: String,
    default: path.resolve(dirname, '../..')
  },
  assetPath: {
    doc: 'Asset path',
    format: String,
    default: '/public',
    env: 'ASSET_PATH'
  },
  isProduction: {
    doc: 'If this application running in the production environment',
    format: Boolean,
    default: isProduction
  },
  isDevelopment: {
    doc: 'If this application running in the development environment',
    format: Boolean,
    default: isDevelopment
  },
  isTest: {
    doc: 'If this application running in the test environment',
    format: Boolean,
    default: isTest
  },
  log: {
    enabled: {
      doc: 'Is logging enabled',
      format: Boolean,
      default: process.env.NODE_ENV !== 'test',
      env: 'LOG_ENABLED'
    },
    level: {
      doc: 'Logging level',
      format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
      default: 'info',
      env: 'LOG_LEVEL'
    },
    format: {
      doc: 'Format to output logs in.',
      format: ['ecs', 'pino-pretty'],
      default: isProduction || isDevelopment ? 'ecs' : 'pino-pretty',
      env: 'LOG_FORMAT'
    },
    redact: {
      doc: 'Log paths to redact',
      format: Array,
      default: isProduction
        ? ['req.headers.authorization', 'req.headers.cookie', 'res.headers']
        : []
    }
  },
  httpProxy: {
    doc: 'HTTP Proxy',
    format: String,
    nullable: true,
    default: null,
    env: 'HTTP_PROXY'
  },
  isSecureContextEnabled: {
    doc: 'Enable Secure Context',
    format: Boolean,
    default: isProduction,
    env: 'ENABLE_SECURE_CONTEXT'
  },
  isMetricsEnabled: {
    doc: 'Enable metrics reporting',
    format: Boolean,
    default: isProduction,
    env: 'ENABLE_METRICS'
  },
  session: {
    cache: {
      engine: {
        doc: 'backend cache is written to',
        format: ['redis', 'memory'],
        default: isProduction ? 'redis' : 'memory',
        env: 'SESSION_CACHE_ENGINE'
      },
      name: {
        doc: 'server side session cache name',
        format: String,
        default: 'session',
        env: 'SESSION_CACHE_NAME'
      },
      ttl: {
        doc: 'server side session cache ttl',
        format: Number,
        default: fourHoursMs,
        env: 'SESSION_CACHE_TTL'
      }
    },
    cookie: {
      ttl: {
        doc: 'Session cookie ttl',
        format: Number,
        default: fourHoursMs,
        env: 'SESSION_COOKIE_TTL'
      },
      password: {
        doc: 'session cookie password',
        format: String,
        default: 'the-password-must-be-at-least-32-characters-long',
        env: 'SESSION_COOKIE_PASSWORD',
        sensitive: true
      },
      secure: {
        doc: 'set secure flag on cookie',
        format: Boolean,
        default: isProduction,
        env: 'SESSION_COOKIE_SECURE'
      }
    }
  },
  redis: {
    host: {
      doc: 'Redis cache host',
      format: String,
      default: '127.0.0.1',
      env: 'REDIS_HOST'
    },
    username: {
      doc: 'Redis cache username',
      format: String,
      default: '',
      env: 'REDIS_USERNAME'
    },
    password: {
      doc: 'Redis cache password',
      format: '*',
      default: '',
      sensitive: true,
      env: 'REDIS_PASSWORD'
    },
    keyPrefix: {
      doc: 'Redis cache key prefix name used to isolate the cached results across multiple clients',
      format: String,
      default: 'waste-organisation-frontend:',
      env: 'REDIS_KEY_PREFIX'
    },
    useSingleInstanceCache: {
      doc: 'Connect to a single instance of redis instead of a cluster.',
      format: Boolean,
      default: !isProduction,
      env: 'USE_SINGLE_INSTANCE_CACHE'
    },
    useTLS: {
      doc: 'Connect to redis using TLS',
      format: Boolean,
      default: isProduction,
      env: 'REDIS_TLS'
    }
  },
  nunjucks: {
    watch: {
      doc: 'Reload templates when they are changed.',
      format: Boolean,
      default: isDevelopment
    },
    noCache: {
      doc: 'Use a cache and recompile templates each time',
      format: Boolean,
      default: isDevelopment
    }
  },
  tracing: {
    header: {
      doc: 'Which header to track',
      format: String,
      default: 'x-cdp-request-id',
      env: 'TRACING_HEADER'
    }
  },
  auth: {
    defraId: {
      oidcConfigurationUrl: {
        doc: 'Defra ID OIDC configuration URL',
        format: String,
        env: 'AUTH_DEFRA_ID_OIDC_CONFIGURATION_URL',
        default:
          'http://localhost:3200/cdp-defra-id-stub/.well-known/openid-configuration'
      },
      serviceId: {
        doc: 'Defra ID service ID',
        format: String,
        env: 'AUTH_DEFRA_ID_SERVICE_ID',
        default: 'd7d72b79-9c62-ee11-8df0-000d3adf7047'
      },
      clientId: {
        doc: 'Defra ID client ID',
        format: String,
        env: 'AUTH_DEFRA_ID_CLIENT_ID',
        default: '63983fc2-cfff-45bb-8ec2-959e21062b9a'
      },
      clientSecret: {
        doc: 'Defra ID client secret',
        format: String,
        sensitive: true,
        env: 'AUTH_DEFRA_ID_CLIENT_SECRET',
        default: 'test_value'
      },
      scopes: {
        doc: 'Defra ID scopes',
        format: Array,
        sensitive: true,
        env: 'AUTH_DEFRA_ID_SCOPES',
        default: ['openid', 'offline_access']
      },
      organisations: {
        doc: 'Defra ID allowed organisations',
        format: Array,
        sensitive: true,
        env: 'AUTH_DEFRA_ID_ORGANISATIONS',
        default: ['7f2f65e0-4858-11f0-afd0-f3af378128f9']
      },
      accountManagementUrl: {
        doc: 'Defra ID account management portal URL',
        format: String,
        env: 'AUTH_DEFRA_ID_ACCOUNT_MANAGEMENT_URL',
        default:
          'http://localhost:3200/cdp-defra-id-stub/register/8a8dffb4-06c2-478f-a47c-1ea08ef29378/relationship?redirect_uri=http://localhost:3000/is-waste-receiver'
      },
      responseType: {
        doc: 'Defra ID Token response type',
        format: String,
        env: 'AUTH_DEFRA_ID_RESPONSE_TYPE',
        default: 'code'
      }
    },
    origins: {
      doc: 'Auth provider origins for CSP header seperated by space',
      format: 'space-separated-string',
      env: 'AUTH_ORIGINS',
      default: []
    }
  }
})

config.validate({ allowed: 'strict' })
