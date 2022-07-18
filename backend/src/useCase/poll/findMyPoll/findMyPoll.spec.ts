import { Result } from 'src/core/result';
import { UnexpectedError } from 'src/core/useCaseError';
import { Poll } from 'src/model/poll';
import { PollRepo } from 'src/repo/pollRepo';
import { FindMyPoll } from './findMyPoll';

const dummyEntity = Poll.create({
  author: 'tester',
  authorId: 'testerId',
  name: 'poll',
  options: ['a', 'b'],
  date: new Date(),
}).getValue();

let useCase: FindMyPoll;
let mockPollRepo: PollRepo;

const buildMockPollRepo = (params?: Partial<PollRepo>) => {
  return {
    find: params?.find ?? jest.fn(),
    findByUserId: params?.findByUserId ?? jest.fn(),
    findOneById: params?.findOneById ?? jest.fn(),
    save: params?.save ?? jest.fn(),
  };
};

describe('FindMyPoll', () => {
  beforeEach(() => {
    mockPollRepo = buildMockPollRepo({
      findByUserId: jest
        .fn()
        .mockResolvedValue(
          Result.ok({ items: [dummyEntity], paginationQueryParams: {} }),
        ),
    });

    useCase = new FindMyPoll(mockPollRepo);
  });

  it('should return dto', async () => {
    const request = { userId: 'tester', queryOptions: {} };

    const response = await useCase.execute(request);

    expect(response.isRight()).toBe(true);
    expect(response.value['items']).toBeDefined();
  });

  describe('when result has next page', () => {
    beforeEach(() => {
      mockPollRepo = buildMockPollRepo({
        findByUserId: jest.fn().mockResolvedValue(
          Result.ok({
            items: [dummyEntity],
            paginationQueryParams: {
              next: `lastEvaluatedKey=${encodeURIComponent(
                JSON.stringify({ key: 'item' }),
              )}`,
            },
          }),
        ),
      });

      useCase = new FindMyPoll(mockPollRepo);
    });

    it('should return the pagination link', async () => {
      const request = { userId: 'tester', queryOptions: {} };

      const response = await useCase.execute(request);

      expect(response.isRight()).toBe(true);
      expect(response.value['_links'].next).toBeDefined();
    });
  });

  describe('when unable to find poll', () => {
    beforeEach(() => {
      mockPollRepo = buildMockPollRepo({
        findByUserId: jest.fn().mockResolvedValue(Result.fail('any')),
      });

      useCase = new FindMyPoll(mockPollRepo);
    });

    it('should return UnexpectedError', async () => {
      const request = { userId: 'tester', queryOptions: {} };

      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });
});
