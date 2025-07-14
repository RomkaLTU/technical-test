import { PlayerRepository } from '../../../../src/domain/capabilities/player-repository';
import { PlayerNotFoundError } from '../../../../src/domain/exceptions/player-not-found-error';
import { Player } from '../../../../src/domain/models/player';
import { PlayerServiceImpl } from '../../../../src/domain/services/manager';

describe('PlayerServiceImpl', () => {
  let playerService: PlayerServiceImpl;
  let mockPlayerRepository: jest.Mocked<PlayerRepository>;

  beforeEach(() => {
    mockPlayerRepository = {
      getOneById: jest.fn(),
      createOne: jest.fn(),
      deleteOne: jest.fn(),
    };

    playerService = new PlayerServiceImpl(mockPlayerRepository);
  });

  describe('getPlayer', () => {
    it('should return a player when found', async () => {
      const playerId = 'player-123';
      const mockPlayer: Player = { id: playerId, name: 'Test Player' };
      mockPlayerRepository.getOneById.mockResolvedValue(mockPlayer);

      const result = await playerService.getPlayer(playerId);

      expect(mockPlayerRepository.getOneById).toHaveBeenCalledWith(playerId);
      expect(result).toEqual(mockPlayer);
    });

    it('should throw PlayerNotFoundError when player not found', async () => {
      const playerId = 'non-existent-player';
      mockPlayerRepository.getOneById.mockRejectedValue(new PlayerNotFoundError(playerId));

      await expect(playerService.getPlayer(playerId)).rejects.toThrow(PlayerNotFoundError);
      expect(mockPlayerRepository.getOneById).toHaveBeenCalledWith(playerId);
    });
  });

  describe('createPlayer', () => {
    it('should create and return a new player', async () => {
      const playerName = 'New Player';
      const mockCreatedPlayer: Player = { id: 'new-player-123', name: playerName };
      mockPlayerRepository.createOne.mockResolvedValue(mockCreatedPlayer);

      const result = await playerService.createPlayer(playerName);

      expect(mockPlayerRepository.createOne).toHaveBeenCalledWith(playerName);
      expect(result).toEqual(mockCreatedPlayer);
    });
  });

  describe('deletePlayer', () => {
    it('should delete an existing player', async () => {
      const playerId = 'player-to-delete';
      const mockPlayer: Player = { id: playerId, name: 'Player to Delete' };
      mockPlayerRepository.getOneById.mockResolvedValue(mockPlayer);
      mockPlayerRepository.deleteOne.mockResolvedValue(undefined);

      await playerService.deletePlayer(playerId);

      expect(mockPlayerRepository.getOneById).toHaveBeenCalledWith(playerId);
      expect(mockPlayerRepository.deleteOne).toHaveBeenCalledWith(mockPlayer);
    });

    it('should throw error when trying to delete non-existent player', async () => {
      const playerId = 'non-existent-player';
      mockPlayerRepository.getOneById.mockRejectedValue(new PlayerNotFoundError(playerId));

      await expect(playerService.deletePlayer(playerId)).rejects.toThrow(PlayerNotFoundError);
      expect(mockPlayerRepository.getOneById).toHaveBeenCalledWith(playerId);
      expect(mockPlayerRepository.deleteOne).not.toHaveBeenCalled();
    });
  });
});
