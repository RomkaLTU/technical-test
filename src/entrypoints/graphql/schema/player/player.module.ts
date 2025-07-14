import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { PlayerServiceImpl } from '../../../../domain/services/manager';
import { factory } from '../../../../framework/provider';
import { PlayerEntity } from '../../../../infrastructure/persistence/entities/player';
import { PlayerRepositoryImpl } from '../../../../infrastructure/persistence/repositories/player';
import { PlayerResolver } from './player.resolver';

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [PlayerEntity],
      contextName: 'MAIN',
    }),
  ],
  providers: [PlayerResolver, factory(PlayerServiceImpl, [PlayerRepositoryImpl])],
  exports: [PlayerResolver, PlayerServiceImpl],
})
export class PlayerModule {}
