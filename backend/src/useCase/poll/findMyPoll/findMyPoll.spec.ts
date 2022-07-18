import { Result } from 'src/core/result';
import { UnexpectedError } from 'src/core/useCaseError';
import { Poll } from 'src/model/poll';
import { PollRepo } from 'src/repo/pollRepo';
import { buildMockPollRepo } from 'src/test/helper';
import { FindMyPoll, FindMyPollRequest } from './findMyPoll';

const dummyEntity = Poll.create({
  author: 'tester',
  authorId: 'testerId',
  name: 'poll',
  options: ['a', 'b'],
  date: new Date(),
}).getValue();

let useCase: FindMyPoll;
let mockPollRepo: PollRepo;

let request: FindMyPollRequest;

beforeEach(() => {
  mockPollRepo = buildMockPollRepo({
    findByUserId: jest.fn().mockResolvedValue(Result.ok([dummyEntity])),
  });

  useCase = new FindMyPoll(mockPollRepo);

  request = { userId: 'tester' };
});

describe('FindMyPoll', () => {
  it('should return dto', async () => {
    const response = await useCase.execute(request);

    expect(response.isRight()).toBe(true);
    expect(response.value['items'].length > 0).toBeDefined();
  });

  describe('when unable to find poll', () => {
    beforeEach(() => {
      mockPollRepo = buildMockPollRepo({
        findByUserId: jest.fn().mockResolvedValue(Result.fail('any')),
      });

      useCase = new FindMyPoll(mockPollRepo);
    });

    it('should return UnexpectedError', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });
});
