import { NOT_FOUND } from 'src/modules/user/constant';
import { Either, left, right } from 'src/common/core/either';
import { UseCase } from 'src/common/core/useCase';
import {
  EntityNotFoundError,
  UnexpectedError,
  UseCaseError,
} from 'src/common/core/useCaseError';
import { UserMapper } from 'src/modules/user/mapper/userMapper';
import { UserDto } from 'src/modules/user/domain/user';
import { UserRepo } from 'src/modules/user/repo/userRepo';

export type FindUserByIdRequest = string;

export type FindUserByIdResponse = Either<UseCaseError, UserDto>;

export class FindUserById
  implements UseCase<FindUserByIdRequest, FindUserByIdResponse>
{
  constructor(private readonly userRepo: UserRepo) {}

  async execute(request: string): Promise<FindUserByIdResponse> {
    const findOneByIdResult = await this.userRepo.findOneById(request);

    if (findOneByIdResult.isFailure) {
      switch (findOneByIdResult.getErrorValue()) {
        case NOT_FOUND:
          return left(new EntityNotFoundError());
        default:
          return left(new UnexpectedError());
      }
    }

    const user = findOneByIdResult.getValue();

    return right(UserMapper.toDto(user));
  }
}
