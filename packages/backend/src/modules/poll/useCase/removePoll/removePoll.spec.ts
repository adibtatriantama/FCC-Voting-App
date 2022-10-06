import { NOT_FOUND } from 'src/modules/user/constant';
import { Result } from 'src/common/core/result';
import {
  EntityNotFoundError,
  UnexpectedError,
} from 'src/common/core/useCaseError';
import { Poll } from 'src/modules/poll/domain/poll';
import { PollRepo } from 'src/modules/poll/repo/pollRepo';
import { buildMockPollRepo } from 'src/modules/user/test/helper';
import {
  RemovePoll,
  RemovePollRequest,
  UnableToRemovePollError,
} from './removePoll';

const dummyPoll = Poll.create(
  {
    author: 'tester',
    authorId: 'testerId',
    name: 'poll',
    options: ['a', 'b'],
    date: new Date(),
  },
  'pollId',
).getValue();

let useCase: RemovePoll;
let mockPollRepo: PollRepo;

let request: RemovePollRequest;

beforeEach(() => {
  mockPollRepo = buildMockPollRepo({
    findOneById: jest.fn().mockResolvedValue(Result.ok(dummyPoll)),
    remove: jest.fn().mockResolvedValue(Result.ok('any')),
  });

  useCase = new RemovePoll(mockPollRepo);

  request = {
    userId: 'testerId',
    pollId: 'pollId',
  };
});

describe('CreatePoll', () => {
  it('should return right result', async () => {
    const response = await useCase.execute(request);

    expect(response.isRight()).toBe(true);
  });

  it('should remove the poll', async () => {
    await useCase.execute(request);

    expect(mockPollRepo.remove).toHaveBeenCalled();
  });

  describe("when user is not the poll's author", () => {
    beforeEach(() => {
      request = {
        userId: 'notAuthorId',
        pollId: 'pollId',
      };
    });

    it('should return UnableToRemovePollError', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnableToRemovePollError);
    });
  });

  describe('when poll not found', () => {
    beforeEach(() => {
      mockPollRepo = buildMockPollRepo({
        findOneById: jest.fn().mockResolvedValue(Result.fail(NOT_FOUND)),
        remove: jest.fn().mockResolvedValue(Result.ok('any')),
      });

      useCase = new RemovePoll(mockPollRepo);
    });

    it('should return EntityNotFoundError', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(EntityNotFoundError);
    });
  });

  describe('when unable to find poll', () => {
    beforeEach(() => {
      mockPollRepo = buildMockPollRepo({
        findOneById: jest.fn().mockResolvedValue(Result.fail('any')),
        remove: jest.fn().mockResolvedValue(Result.ok('any')),
      });

      useCase = new RemovePoll(mockPollRepo);
    });

    it('should return UnexpectedError', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });

  describe('when unable to remove poll', () => {
    beforeEach(() => {
      mockPollRepo = buildMockPollRepo({
        findOneById: jest.fn().mockResolvedValue(Result.ok(dummyPoll)),
        remove: jest.fn().mockResolvedValue(Result.fail('any')),
      });

      useCase = new RemovePoll(mockPollRepo);
    });

    it('should return UnexpectedError', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });
});
