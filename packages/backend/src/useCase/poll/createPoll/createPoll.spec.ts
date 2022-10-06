import { Result } from 'src/core/result';
import { UnexpectedError } from 'src/core/useCaseError';
import { User } from 'src/model/user';
import { PollRepo } from 'src/repo/pollRepo';
import { UserRepo } from 'src/repo/userRepo';
import { buildMockPollRepo, buildMockUserRepo } from 'src/test/helper';
import { CreatePoll, CreatePollRequest, PollCreationError } from './createPoll';

let useCase: CreatePoll;
let mockPollRepo: PollRepo;
let mockUserRepo: UserRepo;

const dummyUser = User.create(
  { nickname: 'tester', email: 'tester@mail.com' },
  'testerId',
);

const buildCreatePollRequest = (
  request?: Partial<CreatePollRequest>,
): CreatePollRequest => {
  return {
    authorId: request?.authorId ?? 'testerId',
    name: request?.name ?? 'poll',
    options: request?.options ?? ['a', 'b'],
    date: request?.date ?? new Date(),
  };
};

describe('CreatePoll', () => {
  beforeEach(() => {
    mockPollRepo = buildMockPollRepo({
      save: jest.fn().mockResolvedValue(Result.ok('any')),
    });
    mockUserRepo = buildMockUserRepo({
      findOneById: jest.fn().mockResolvedValue(Result.ok(dummyUser)),
    });

    useCase = new CreatePoll(mockPollRepo, mockUserRepo);
  });

  it('should return dto', async () => {
    const request = buildCreatePollRequest();

    const response = await useCase.execute(request);

    expect(response.isRight()).toBe(true);
    expect(response.value).toBeDefined();
  });

  it('should save the poll', async () => {
    const request = buildCreatePollRequest();

    await useCase.execute(request);

    expect(mockPollRepo.save).toHaveBeenCalled();
  });

  describe('When poll is invalid', () => {
    it('should return PollCreationError', async () => {
      // will invalid because only have 1 option
      const request = buildCreatePollRequest({
        options: ['a'],
      });

      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(PollCreationError);
    });
  });

  describe('when unable to save', () => {
    beforeEach(() => {
      mockPollRepo = buildMockPollRepo({
        save: jest.fn().mockResolvedValue(Result.fail('error')),
      });

      mockUserRepo = buildMockUserRepo({
        findOneById: jest.fn().mockResolvedValue(Result.ok(dummyUser)),
      });

      useCase = new CreatePoll(mockPollRepo, mockUserRepo);
    });

    it('should return unexpected error', async () => {
      const request = buildCreatePollRequest();

      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });

  describe('when unable to get user', () => {
    beforeEach(() => {
      mockPollRepo = buildMockPollRepo({
        save: jest.fn().mockResolvedValue(Result.ok('any')),
      });

      mockUserRepo = buildMockUserRepo({
        findOneById: jest.fn().mockResolvedValue(Result.fail('any')),
      });

      useCase = new CreatePoll(mockPollRepo, mockUserRepo);
    });

    it('should return unexpected error', async () => {
      const request = buildCreatePollRequest();

      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });
});
