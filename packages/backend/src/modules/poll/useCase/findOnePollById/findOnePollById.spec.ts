import { NOT_FOUND } from 'src/modules/user/constant';
import { Result } from 'src/common/core/result';
import {
  EntityNotFoundError,
  UnexpectedError,
} from 'src/common/core/useCaseError';
import { Poll } from 'src/modules/poll/domain/poll';
import { PollRepo } from 'src/modules/poll/repo/pollRepo';
import { buildMockPollRepo } from 'src/modules/user/test/helper';
import { FindOnePollById } from './findOnePollBy';

const dummyEntity = Poll.create({
  author: 'tester',
  authorId: 'testerId',
  name: 'poll',
  options: ['a', 'b'],
  date: new Date(),
}).getValue();

let useCase: FindOnePollById;
let mockPollRepo: PollRepo;

describe('FindOnePollById', () => {
  beforeEach(() => {
    mockPollRepo = buildMockPollRepo({
      findOneById: jest.fn().mockResolvedValue(Result.ok(dummyEntity)),
    });

    useCase = new FindOnePollById(mockPollRepo);
  });

  it('should return dto', async () => {
    const request = 'pollId';

    const response = await useCase.execute(request);

    expect(response.isRight()).toBe(true);
    expect(response.value).toBeDefined();
  });

  describe('when entity not found', () => {
    beforeEach(() => {
      mockPollRepo = buildMockPollRepo({
        findOneById: jest.fn().mockResolvedValue(Result.fail(NOT_FOUND)),
      });

      useCase = new FindOnePollById(mockPollRepo);
    });

    it('should return EntityNotFoundError', async () => {
      const request = 'pollId';

      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(EntityNotFoundError);
    });
  });

  describe('when unable to find the entity', () => {
    beforeEach(() => {
      mockPollRepo = buildMockPollRepo({
        findOneById: jest.fn().mockResolvedValue(Result.fail('any')),
      });

      useCase = new FindOnePollById(mockPollRepo);
    });

    it('should return UnexpectedError', async () => {
      const request = 'pollId';

      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });
});
