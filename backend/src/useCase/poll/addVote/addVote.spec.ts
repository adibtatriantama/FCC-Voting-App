import { NOT_FOUND } from 'src/constant';
import { Result } from 'src/core/result';
import { EntityNotFoundError, UnexpectedError } from 'src/core/useCaseError';
import { Poll, PollProps } from 'src/model/poll';
import { PollRepo } from 'src/repo/pollRepo';
import { buildMockPollRepo } from 'src/test/helper';
import { AddVote, AddVoteRequest, UnableToCreateOptionError } from './addVote';

const buildRequest = (request?: Partial<AddVoteRequest>): AddVoteRequest => {
  return {
    pollId: 'pollId',
    isAuthenticated: false,
    option: 'a',
    ...(request ?? {}),
  };
};

const buildDummyPoll = (pollProps?: Partial<PollProps>, id?: string) => {
  return Poll.create(
    {
      author: 'tester',
      authorId: 'testerId',
      name: 'poll',
      options: ['a', 'b'],
      date: new Date(),
      ...(pollProps ?? {}),
    },
    id ?? 'pollId',
  ).getValue();
};

let useCase: AddVote;
let mockPollRepo: PollRepo;

afterEach(() => {
  jest.clearAllMocks();
});

describe('AddVote', () => {
  beforeEach(() => {
    mockPollRepo = buildMockPollRepo({
      findOneById: jest.fn().mockResolvedValue(Result.ok(buildDummyPoll())),
      save: jest.fn().mockResolvedValue(Result.ok(buildDummyPoll())),
    });

    useCase = new AddVote(mockPollRepo);
  });

  it('should return dto', async () => {
    const request = buildRequest();

    const response = await useCase.execute(request);

    expect(response.isRight()).toBe(true);
    expect(response.value).toBeDefined();
  });

  it('should save the poll', async () => {
    const request = buildRequest();

    await useCase.execute(request);

    expect(mockPollRepo.save).toHaveBeenCalled();
  });

  it('saved poll should contain the vote', async () => {
    const saveSpy = jest.spyOn(mockPollRepo, 'save');

    const request = buildRequest();

    await useCase.execute(request);

    expect(saveSpy.mock.calls[0][0].unsavedVote).toBeDefined();
  });

  describe('when option is not exist and user is not authenticated', () => {
    beforeEach(() => {
      mockPollRepo = buildMockPollRepo({
        findOneById: jest.fn().mockResolvedValue(Result.ok(buildDummyPoll())),
      });

      useCase = new AddVote(mockPollRepo);
    });

    it('should return UnableToCreateOptionError', async () => {
      const request = buildRequest({
        isAuthenticated: false,
        option: 'new option',
      });

      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnableToCreateOptionError);
    });
  });

  describe('when poll is not found', () => {
    beforeEach(() => {
      mockPollRepo = buildMockPollRepo({
        findOneById: jest.fn().mockResolvedValue(Result.fail(NOT_FOUND)),
      });

      useCase = new AddVote(mockPollRepo);
    });

    it('should return EntityNotFoundError', async () => {
      const request = buildRequest();

      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(EntityNotFoundError);
    });
  });

  describe('when unable to find one poll', () => {
    beforeEach(() => {
      mockPollRepo = buildMockPollRepo({
        findOneById: jest.fn().mockResolvedValue(Result.fail('any')),
      });

      useCase = new AddVote(mockPollRepo);
    });

    it('should return UnexpectedError', async () => {
      const request = buildRequest();

      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });

  describe('when unable to save poll', () => {
    beforeEach(() => {
      mockPollRepo = buildMockPollRepo({
        findOneById: jest.fn().mockResolvedValue(Result.ok(buildDummyPoll())),
        save: jest.fn().mockResolvedValue(Result.fail('any')),
      });

      useCase = new AddVote(mockPollRepo);
    });

    it('should return UnexpectedError', async () => {
      const request = buildRequest();

      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });
});
