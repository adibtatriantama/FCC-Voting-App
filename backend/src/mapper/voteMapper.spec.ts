import { VoteMapper } from './voteMapper';

describe('VoteMapper', () => {
  describe('toDynamoDbModel', () => {
    it('should map correctly', () => {
      const expected = {
        PK: 'p#poll1',
        SK: 'pv#voter1',
        option: 'option a',
        date: '2022-08-28T17:00:00.000Z',
        pollId: 'poll1',
        userId: 'voter1',
      };
      const vote = {
        pollId: 'poll1',
        userId: 'voter1',
        option: 'option a',
        isOptionNew: false,
        date: new Date(2022, 7, 29),
      };

      const result = VoteMapper.toDynamoDbModel(vote);

      expect(result).toStrictEqual(expected);
    });
  });

  describe('toValueObject', () => {
    it('should map correctly', () => {
      const expected = {
        pollId: 'poll1',
        userId: 'voter1',
        option: 'option a',
        isOptionNew: false,
        date: new Date(2022, 7, 29),
      };

      const input = {
        PK: 'p#poll1',
        SK: 'pv#voter1',
        option: 'option a',
        date: '2022-08-28T17:00:00.000Z',
        pollId: 'poll1',
        userId: 'voter1',
      };

      const result = VoteMapper.toValueObject(input);

      expect(result).toStrictEqual(expected);
    });
  });
});
