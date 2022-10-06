import { Result } from 'src/core/result';
import { UnexpectedError } from 'src/core/useCaseError';
import { Poll } from 'src/model/poll';
import { PollRepo } from 'src/repo/pollRepo';
import { buildMockPollRepo } from 'src/test/helper';
import { FindPoll } from './findPoll';

const dummyEntity = Poll.create({
  author: 'tester',
  authorId: 'testerId',
  name: 'poll',
  options: ['a', 'b'],
  date: new Date(),
}).getValue();

let useCase: FindPoll;
let mockPollRepo: PollRepo;

describe('FindPoll', () => {
  beforeEach(() => {
    mockPollRepo = buildMockPollRepo({
      find: jest.fn().mockResolvedValue(Result.ok([dummyEntity])),
    });

    useCase = new FindPoll(mockPollRepo);
  });

  it('should return dto', async () => {
    const response = await useCase.execute();

    expect(response.isRight()).toBe(true);
    expect(response.value['items'].length > 0).toBeDefined();
  });

  describe('when unable to find poll', () => {
    beforeEach(() => {
      mockPollRepo = buildMockPollRepo({
        find: jest.fn().mockResolvedValue(Result.fail('any')),
      });

      useCase = new FindPoll(mockPollRepo);
    });

    it('should return UnexpectedError', async () => {
      const response = await useCase.execute();

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });
});
