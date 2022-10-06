import { NOT_FOUND } from 'src/constant';
import { Result } from 'src/core/result';
import { UnexpectedError } from 'src/core/useCaseError';
import { User } from 'src/model/user';
import { UserRepo } from 'src/repo/userRepo';
import { buildMockUserRepo } from 'src/test/helper';
import { CreateUser, UserAlreadyExist } from './createUser';

let useCase: CreateUser;
let mockUserRepo: UserRepo;

const dummyRequest = {
  id: 'testerId',
  nickname: 'tester',
  email: 'tester@mail.com',
};
const dummyUser = User.create(
  { nickname: 'tester', email: 'tester@mail.com' },
  'testerId',
);

afterEach(() => {
  jest.clearAllMocks();
});

describe('CreateUser', () => {
  beforeEach(() => {
    mockUserRepo = buildMockUserRepo({
      findOneById: jest.fn().mockResolvedValue(Result.fail(NOT_FOUND)),
      save: jest.fn().mockResolvedValue(Result.ok()),
    });

    useCase = new CreateUser(mockUserRepo);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return dto', async () => {
    const response = await useCase.execute(dummyRequest);

    expect(response.isRight()).toBe(true);
    expect(response.value).toBeDefined();
  });

  it('should save the user', async () => {
    await useCase.execute(dummyRequest);

    expect(mockUserRepo.save).toHaveBeenCalled();
  });

  describe('when user with same id already exist', () => {
    beforeEach(() => {
      mockUserRepo = buildMockUserRepo({
        findOneById: jest.fn().mockResolvedValue(Result.ok(dummyUser)),
        save: jest.fn(),
      });

      useCase = new CreateUser(mockUserRepo);
    });

    it('should not save the user', async () => {
      await useCase.execute(dummyRequest);

      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });

    it('should return UserAlreadyExist', async () => {
      const response = await useCase.execute(dummyRequest);

      expect(response.isLeft()).toBe(true);
      expect(response.value.constructor).toBe(UserAlreadyExist);
    });
  });

  describe('when unable to save', () => {
    beforeEach(() => {
      mockUserRepo = buildMockUserRepo({
        findOneById: jest.fn().mockResolvedValue(Result.fail(NOT_FOUND)),
        save: jest.fn().mockResolvedValue(Result.fail(NOT_FOUND)),
      });

      useCase = new CreateUser(mockUserRepo);
    });

    it('should return UnexpectedError', async () => {
      const response = await useCase.execute(dummyRequest);

      expect(response.isLeft()).toBe(true);
      expect(response.value.constructor).toBe(UnexpectedError);
    });
  });

  describe('when unable to check if user with same id is already exist', () => {
    beforeEach(() => {
      mockUserRepo = {
        findOneById: jest.fn().mockResolvedValue(Result.fail('other error')),
        save: jest.fn(),
      };
      useCase = new CreateUser(mockUserRepo);
    });

    it('should return UnexpectedError', async () => {
      const response = await useCase.execute(dummyRequest);

      expect(response.isLeft()).toBe(true);
      expect(response.value.constructor).toBe(UnexpectedError);
    });
  });
});
