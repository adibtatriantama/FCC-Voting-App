import { NOT_FOUND } from 'src/constant';
import { Either, left, right } from 'src/core/either';
import { UseCase } from 'src/core/useCase';
import {
  EntityNotFoundError,
  UnexpectedError,
  UseCaseError,
} from 'src/core/useCaseError';
import { UserMapper } from 'src/mapper/userMapper';
import { UserDto } from 'src/model/user';
import { UserRepo } from 'src/repo/userRepo';

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
