import { Options } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Logger, LoggerModule, Params, PinoLogger } from 'nestjs-pino';

import { AppOptions, CONFIG } from './config';
import { GraphQLAppModule } from './entrypoints/graphql/graphql.module';
import { HealthCheckModule } from './infrastructure/health-check/module';
import { PlayerEntity } from './infrastructure/persistence/entities/player';

@Module({
  imports: [
    ConfigModule.forRoot({ load: Object.values(CONFIG), isGlobal: true }),
    MikroOrmModule.forRoot({ ...(CONFIG.DB() as Options), registerRequestContext: false }),
    MikroOrmModule.forFeature({ entities: [PlayerEntity], contextName: 'MAIN' }),
    MikroOrmModule.forMiddleware(),
    LoggerModule.forRoot(CONFIG.LOGGER() as Params),
    GraphQLAppModule,
    HealthCheckModule,
  ],
  providers: [],
  controllers: [],
})
export class MainModule {
  static async run(): Promise<void> {
    const logger = new Logger(new PinoLogger(CONFIG.LOGGER() as Params), {});
    const options = CONFIG.APP() as AppOptions;

    try {
      const app = await NestFactory.create(MainModule, {
        bufferLogs: true,
      });

      app.enableCors({ origin: options.allowedOrigins || false });
      app.setGlobalPrefix(options.prefix, { exclude: ['graphql', 'graphiql'] });
      app.useLogger(logger);
      app.flushLogs();

      app.enableShutdownHooks();

      await app.listen(options.port, options.host);

      logger.log('🚀 Application started successfully');
      logger.log(`📊 GraphQL API: http://${options.host}:${options.port}/graphql`);
      logger.log(`🎮 GraphiQL Playground: http://${options.host}:${options.port}/graphiql`);
      logger.log(`❤️ Health Check: http://${options.host}:${options.port}/${options.prefix}/_health`);
    } catch (error) {
      logger.error(`${MainModule.name}: failed`);
      logger.error(error);
      process.exit(1);
    }
  }
}

MainModule.run();
