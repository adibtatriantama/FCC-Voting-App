import { NOT_FOUND } from 'src/modules/user/constant';
import { Result } from 'src/common/core/result';
import {
  EntityNotFoundError,
  UnexpectedError,
} from 'src/common/core/useCaseError';
import { User } from 'src/modules/user/domain/user';
import { UserRepo } from 'src/modules/user/repo/userRepo';
import { buildMockUserRepo } from 'src/modules/user/test/helper';
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
