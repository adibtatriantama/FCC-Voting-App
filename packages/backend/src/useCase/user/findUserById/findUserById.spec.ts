import { NOT_FOUND } from 'src/constant';
import { Result } from 'src/core/result';
import { EntityNotFoundError, UnexpectedError } from 'src/core/useCaseError';
import { User } from 'src/model/user';
import { UserRepo } from 'src/repo/userRepo';
import { buildMockUserRepo } from 'src/test/helper';
import { FindUserById } from './findUserById';

const dummyEntity = User.create(
  { nickname: 'tester', email: 'tester@mail.com' },
  'userId',
);

let useCase: FindUserById;
let mockUserRepo: UserRepo;

describe('FindUserById', () => {
  beforeEach(() => {
    mockUserRepo = buildMockUserRepo({
      findOneById: jest.fn().mockResolvedValue(Result.ok(dummyEntity)),
    });

    useCase = new FindUserById(mockUserRepo);
  });

  it('should return dto', async () => {
    const request = 'userId';

    const response = await useCase.execute(request);

    expect(response.isRight()).toBe(true);
    expect(response.value).toBeDefined();
  });

  describe('when entity not found', () => {
    beforeEach(() => {
      mockUserRepo = buildMockUserRepo({
        findOneById: jest.fn().mockResolvedValue(Result.fail(NOT_FOUND)),
      });

      useCase = new FindUserById(mockUserRepo);
    });

    it('should return EntityNotFoundError', async () => {
      const request = 'userId';

      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(EntityNotFoundError);
    });
  });

  describe('when unable to find the entity', () => {
    beforeEach(() => {
      mockUserRepo = buildMockUserRepo({
        findOneById: jest.fn().mockResolvedValue(Result.fail('any')),
      });

      useCase = new FindUserById(mockUserRepo);
    });

    it('should return UnexpectedError', async () => {
      const request = 'userId';

      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });
});
