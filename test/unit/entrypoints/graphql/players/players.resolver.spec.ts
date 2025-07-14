import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PlayerNotFoundError } from '../../../../../src/domain/exceptions/player-not-found-error';
import { PlayerServiceImpl } from '../../../../../src/domain/services/manager';
import { PlayerResolver } from '../../../../../src/entrypoints/graphql/schema/player/player.resolver';

describe('PlayerResolver', () => {
  let resolver: PlayerResolver;
  let mockPlayerService: jest.Mocked<PlayerServiceImpl>;

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    mockPlayerService = {
      getPlayer: jest.fn(),
      createPlayer: jest.fn(),
      deletePlayer: jest.fn(),
      playerRepository: {} as any,
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerResolver,
        {
          provide: PlayerServiceImpl,
          useValue: mockPlayerService,
        },
      ],
    }).compile();

    resolver = module.get<PlayerResolver>(PlayerResolver);

    Object.defineProperty(resolver, 'logger', {
      value: mockLogger,
      writable: true,
    });

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getPlayer', () => {
    it('should return a player when found', async () => {
      const mockPlayer = { id: '123', name: 'John Doe' };
      mockPlayerService.getPlayer.mockResolvedValue(mockPlayer);

      const result = await resolver.getPlayer('123');

      expect(mockPlayerService.getPlayer).toHaveBeenCalledWith('123');
      expect(result).toEqual({
        id: '123',
        name: 'John Doe',
        teamId: 'team-placeholder',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should throw NotFoundException when player not found', async () => {
      mockPlayerService.getPlayer.mockRejectedValue(new PlayerNotFoundError('123'));

      await expect(resolver.getPlayer('123')).rejects.toThrow(NotFoundException);
      expect(mockPlayerService.getPlayer).toHaveBeenCalledWith('123');
    });
  });

  describe('createPlayer', () => {
    it('should create and return a new player', async () => {
      const input = { name: 'John Doe' };
      const mockPlayer = { id: '123', name: 'John Doe' };
      mockPlayerService.createPlayer.mockResolvedValue(mockPlayer);

      const result = await resolver.createPlayer(input);

      expect(mockPlayerService.createPlayer).toHaveBeenCalledWith('John Doe');
      expect(result).toEqual({
        id: '123',
        name: 'John Doe',
        teamId: 'default-team',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should create player with custom team ID', async () => {
      const input = { name: 'John Doe', teamId: 'custom-team' };
      const mockPlayer = { id: '123', name: 'John Doe' };
      mockPlayerService.createPlayer.mockResolvedValue(mockPlayer);

      const result = await resolver.createPlayer(input);

      expect(result.teamId).toBe('custom-team');
    });

    it('should throw BadRequestException for empty name', async () => {
      const input = { name: '   ' }; // Empty/whitespace name

      await expect(resolver.createPlayer(input)).rejects.toThrow(BadRequestException);
      expect(mockPlayerService.createPlayer).not.toHaveBeenCalled();
    });
  });

  describe('updatePlayer', () => {
    it('should update and return player', async () => {
      const mockPlayer = { id: '123', name: 'John Doe' };
      const updateInput = { name: 'Jane Doe' };
      mockPlayerService.getPlayer.mockResolvedValue(mockPlayer);

      const result = await resolver.updatePlayer('123', updateInput);

      expect(mockPlayerService.getPlayer).toHaveBeenCalledWith('123');
      expect(result.name).toBe('Jane Doe');
      expect(result.id).toBe('123');
    });

    it('should throw NotFoundException when updating non-existent player', async () => {
      const updateInput = { name: 'Jane Doe' };
      mockPlayerService.getPlayer.mockRejectedValue(new PlayerNotFoundError('123'));

      await expect(resolver.updatePlayer('123', updateInput)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deletePlayer', () => {
    it('should delete a player and return true', async () => {
      mockPlayerService.deletePlayer.mockResolvedValue(undefined);

      const result = await resolver.deletePlayer('123');

      expect(mockPlayerService.deletePlayer).toHaveBeenCalledWith('123');
      expect(result).toBe(true);
    });

    it('should throw NotFoundException when deleting non-existent player', async () => {
      mockPlayerService.deletePlayer.mockRejectedValue(new PlayerNotFoundError('123'));

      await expect(resolver.deletePlayer('123')).rejects.toThrow(NotFoundException);
      expect(mockPlayerService.deletePlayer).toHaveBeenCalledWith('123');
    });
  });

  describe('getAllPlayers', () => {
    it('should return empty array (placeholder implementation)', async () => {
      const result = await resolver.getAllPlayers();

      expect(result).toEqual([]);
    });
  });
});
