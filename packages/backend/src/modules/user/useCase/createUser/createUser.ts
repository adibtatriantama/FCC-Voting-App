import { NOT_FOUND } from 'src/modules/user/constant';
import { Either, left, right } from 'src/common/core/either';
import { UseCase } from 'src/common/core/useCase';
import { UseCaseError, UnexpectedError } from 'src/common/core/useCaseError';
import { UserMapper } from 'src/modules/user/mapper/userMapper';
import { UserDto, User } from 'src/modules/user/domain/user';
import { UserRepo } from 'src/modules/user/repo/userRepo';

export type CreateUserRequest = {
  id: string;
  email: string;
  nickname: string;
};

export type CreateUserResponse = Either<UseCaseError, UserDto>;

export class UserAlreadyExist extends UseCaseError {
  constructor() {
    super('User already exist');
  }
}

export class CreateUser
  implements UseCase<CreateUserRequest, CreateUserResponse>
{
  constructor(private readonly userRepo: UserRepo) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    const findExistingUserResult = await this.userRepo.findOneById(request.id);

    if (findExistingUserResult.isSuccess) {
      return left(new UserAlreadyExist());
    } else if (findExistingUserResult.getErrorValue() !== NOT_FOUND) {
      return left(new UnexpectedError());
    }
    const user = User.create(
      { nickname: request.nickname, email: request.email },
      request.id,
    );

    const saveResult = await this.userRepo.save(user);

    if (saveResult.isFailure) {
      return left(new UnexpectedError());
    }

    return right(UserMapper.toDto(user));
  }
}
