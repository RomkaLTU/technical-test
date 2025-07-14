import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';

import { GraphiQLController } from './playground/graphiql.controller';
import { PlayerModule } from './schema/player/player.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: false,
      introspection: true,
      path: '/graphql',
      context: ({ req, res }: { req: any; res: any }) => ({ req, res }),
      formatError: (error) => {
        console.error('GraphQL Error:', error);
        return {
          message: error.message,
          code: error.extensions?.code,
          path: error.path,
        };
      },
      cors: {
        origin: true,
        credentials: true,
      },
    }),
    PlayerModule,
  ],
  providers: [],
  controllers: [GraphiQLController],
  exports: [GraphQLModule, PlayerModule],
})
export class GraphQLAppModule {}
