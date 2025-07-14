import { Options } from '@mikro-orm/core';
import { registerAs } from '@nestjs/config';
import { Params } from 'nestjs-pino';
import pino from 'pino';

import { CONSTANTS } from './constants';
import { errorSerializer } from './infrastructure/logging/serializer';

export type AppOptions = {
  readonly allowedOrigins?: string;

  readonly environment: string;

  readonly host: string;

  readonly port: number;

  readonly prefix: string;

  readonly name: string;

  readonly version: string;
};

const defaultAppOptions: AppOptions = {
  environment: 'development',

  host: '0.0.0.0',

  port: 4000,

  prefix: 'api',

  name: 'unknown',

  version: 'unknown',
};

export const CONFIG = {
  APP: registerAs<AppOptions>(CONSTANTS.APP, (): AppOptions => {
    return {
      host: defaultAppOptions.host,
      port: Number(process.env.PORT) || 4000,
      prefix: process.env.APP_PREFIX || defaultAppOptions.prefix,
      version: process.env.APP_VERSION || defaultAppOptions.version,
      environment: process.env.APP_ENV || defaultAppOptions.environment,
      name: process.env.APP_NAME || defaultAppOptions.name,
    };
  }),

  LOGGER: registerAs<Params>(CONSTANTS.LOGGER, (): Params => {
    return {
      exclude: [],
      pinoHttp: {
        wrapSerializers: true,
        serializers: {
          err: errorSerializer,
        },
        logger: pino({
          messageKey: 'message',
          timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
          formatters: {
            level: (level) => ({ level }),
          },
          base: {
            environment: process.env.APP_ENV || defaultAppOptions.environment,
            service: process.env.APP_NAME || defaultAppOptions.name,
          },
        }),
      },
    };
  }),

  DB: registerAs<Options>(CONSTANTS.DB, (): Options => {
    return {
      contextName: 'MAIN',
      type: 'postgresql',
      clientUrl: process.env.DB_CLIENT_URL || 'unknown',
      entities: ['dist/infrastructure/persistence/entities/*.js'],
      entitiesTs: ['src/infrastructure/persistence/entities/*.ts'],
      debug: process.env.APP_ENV !== 'production',
      allowGlobalContext: false,
      forceUndefined: true,
    };
  }),
};
