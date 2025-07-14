import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PlayerNotFoundError } from '../../../../domain/exceptions/player-not-found-error';
import { PlayerServiceImpl } from '../../../../domain/services/manager';
import { CreatePlayerInput, UpdatePlayerInput } from './player.inputs';
import { PlayerType } from './player.types';

@Resolver(() => PlayerType)
export class PlayerResolver {
  constructor(private readonly playerService: PlayerServiceImpl) {}

  @Query(() => PlayerType, { name: 'player' })
  async getPlayer(@Args('id', { type: () => ID }) id: string): Promise<PlayerType> {
    try {
      const player = await this.playerService.getPlayer(id);

      return {
        id: player.id,
        name: player.name,
        teamId: 'team-placeholder',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      if (error instanceof PlayerNotFoundError) {
        throw new NotFoundException(`Player with ID "${id}" not found`);
      }
      throw error;
    }
  }

  @Query(() => [PlayerType], { name: 'players' })
  async getAllPlayers(): Promise<PlayerType[]> {
    return [];
  }

  @Mutation(() => PlayerType, { name: 'createPlayer' })
  async createPlayer(@Args('input') input: CreatePlayerInput): Promise<PlayerType> {
    if (!input.name?.trim()) {
      throw new BadRequestException('Player name cannot be empty');
    }

    const player = await this.playerService.createPlayer(input.name.trim());

    return {
      id: player.id,
      name: player.name,
      teamId: input.teamId || 'default-team',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  @Mutation(() => PlayerType, { name: 'updatePlayer' })
  async updatePlayer(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePlayerInput,
  ): Promise<PlayerType> {
    try {
      const existingPlayer = await this.playerService.getPlayer(id);

      return {
        id: existingPlayer.id,
        name: input.name || existingPlayer.name,
        teamId: input.teamId || 'team-placeholder',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      if (error instanceof PlayerNotFoundError) {
        throw new NotFoundException(`Player with ID "${id}" not found`);
      }
      throw error;
    }
  }

  @Mutation(() => Boolean, { name: 'deletePlayer' })
  async deletePlayer(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    try {
      await this.playerService.deletePlayer(id);
      return true;
    } catch (error) {
      if (error instanceof PlayerNotFoundError) {
        throw new NotFoundException(`Player with ID "${id}" not found`);
      }
      throw error;
    }
  }
}
