import { PollRepo } from 'src/modules/poll/repo/pollRepo';
import { UserRepo } from 'src/modules/user/repo/userRepo';

export const buildMockPollRepo = (params?: Partial<PollRepo>) => {
  return {
    find: params?.find ?? jest.fn(),
    findByUserId: params?.findByUserId ?? jest.fn(),
    findOneById: params?.findOneById ?? jest.fn(),
    save: params?.save ?? jest.fn(),
    remove: params?.remove ?? jest.fn(),
  };
};

export const buildMockUserRepo = (params?: Partial<UserRepo>) => {
  return {
    findOneById: params?.findOneById ?? jest.fn(),
    save: params?.save ?? jest.fn(),
  };
};
