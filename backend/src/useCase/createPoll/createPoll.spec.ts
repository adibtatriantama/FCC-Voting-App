import { Result } from 'src/core/result';
import { UnexpectedError } from 'src/core/useCaseError';
import { PollRepo } from 'src/repo/pollRepo';
import { CreatePoll, CreatePollRequest, PollCreationError } from './createPoll';

let useCase: CreatePoll;
let mockPollRepo: PollRepo;

const buildCreatePollRequest = (
  request?: Partial<CreatePollRequest>,
): CreatePollRequest => {
  return {
    author: request?.author ?? 'tester',
    authorId: request?.authorId ?? 'testerId',
    name: request?.name ?? 'poll',
    options: request?.options ?? ['a', 'b'],
    enableOtherOption: request?.enableOtherOption ?? true,
    date: request?.date ?? new Date(),
  };
};

const buildMockPollRepo = (params?: Partial<PollRepo>) => {
  return {
    find: params?.find ?? jest.fn(),
    findByUserId: params?.findByUserId ?? jest.fn(),
    findOneById: params?.findOneById ?? jest.fn(),
    save: params?.save ?? jest.fn(),
  };
};

describe('CreatePoll', () => {
  beforeEach(() => {
    mockPollRepo = buildMockPollRepo({
      save: jest.fn().mockResolvedValue(Result.ok('any')),
    });

    useCase = new CreatePoll(mockPollRepo);
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
        enableOtherOption: false,
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

      useCase = new CreatePoll(mockPollRepo);
    });

    it('should return unexpected error', async () => {
      const request = buildCreatePollRequest();

      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });
});
