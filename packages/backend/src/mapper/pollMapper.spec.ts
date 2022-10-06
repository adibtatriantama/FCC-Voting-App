import { Poll } from 'src/model/poll';
import { PollMapper } from './pollMapper';

const dummyDate = new Date();
const dummyDateIsoString = dummyDate.toISOString();

describe('PollMapper', () => {
  describe('toDynamoDbModel', () => {
    it('should map correctly', () => {
      const expected = {
        PK: `p#poll1`,
        SK: 'metadata',
        GSI1PK: 'u#testerId',
        GSI1SK: `p#poll1`,
        GSI2PK: 'poll',
        GSI2SK: dummyDateIsoString,
        id: 'poll1',
        voteCount: 0,
        options: ['a', 'b'],
        name: 'poll name',
        date: dummyDateIsoString,
        author: 'tester',
        authorId: 'testerId',
        voteCountPerOption: { a: 0, b: 0 },
      };

      const entity = Poll.create(
        {
          options: ['a', 'b'],
          name: 'poll name',
          date: dummyDate,
          author: 'tester',
          authorId: 'testerId',
        },
        'poll1',
      ).getValue();

      const result = PollMapper.toDynamoDbModel(entity);

      expect(result).toStrictEqual(expected);
    });
  });

  describe('toDto', () => {
    it('should map correctly', () => {
      const expected = {
        id: 'poll1',
        voteCount: 0,
        options: ['a', 'b'],
        name: 'poll name',
        date: dummyDateIsoString,
        author: 'tester',
        authorId: 'testerId',
        voteCountPerOption: { a: 0, b: 0 },
      };

      const entity = Poll.create(
        {
          options: ['a', 'b'],
          name: 'poll name',
          date: dummyDate,
          author: 'tester',
          authorId: 'testerId',
        },
        'poll1',
      ).getValue();

      const result = PollMapper.toDto(entity);

      expect(result).toStrictEqual(expected);
    });
  });
  describe('toEntity', () => {
    it('should map correctly', () => {
      const expected = Poll.create(
        {
          options: ['a', 'b'],
          name: 'poll name',
          date: dummyDate,
          voteCountPerOption: {
            a: 33,
            b: 111,
          },
          voteCount: 144,
          author: 'tester',
          authorId: 'testerId',
        },
        'poll1',
      ).getValue();

      const input = {
        PK: `p#poll1`,
        SK: 'metadata',
        GSI1PK: 'u#testerId',
        GSI1SK: `p#poll1`,
        GSI2PK: 'poll',
        GSI2SK: dummyDateIsoString,
        id: 'poll1',
        voteCount: 144,
        options: ['a', 'b'],
        name: 'poll name',
        date: dummyDateIsoString,
        author: 'tester',
        authorId: 'testerId',
        voteCountPerOption: { a: 33, b: 111 },
      };

      const result = PollMapper.toEntity(input);

      expect(result).toEqual(expected);
    });
  });
});
