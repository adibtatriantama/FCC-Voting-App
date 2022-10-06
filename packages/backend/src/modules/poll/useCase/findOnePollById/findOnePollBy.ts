import { NOT_FOUND } from 'src/modules/user/constant';
import { Either, left, right } from 'src/common/core/either';
import { UseCase } from 'src/common/core/useCase';
import {
  EntityNotFoundError,
  UnexpectedError,
  UseCaseError,
} from 'src/common/core/useCaseError';
import { PollMapper } from 'src/modules/poll/mapper/pollMapper';
import { PollDto } from 'src/modules/poll/domain/poll';
import { PollRepo } from 'src/modules/poll/repo/pollRepo';

export type FindOnePollByIdRequest = string;

export type FindOnePollByIdResponse = Either<UseCaseError, PollDto>;

export class FindOnePollById
  implements UseCase<FindOnePollByIdRequest, FindOnePollByIdResponse>
{
  constructor(private readonly pollRepo: PollRepo) {}

  async execute(request: string): Promise<FindOnePollByIdResponse> {
    const findOneByIdResult = await this.pollRepo.findOneById(request);

    if (findOneByIdResult.isFailure) {
      switch (findOneByIdResult.getErrorValue()) {
        case NOT_FOUND:
          return left(new EntityNotFoundError());
        default:
          return left(new UnexpectedError());
      }
    }

    const poll = findOneByIdResult.getValue();

    return right(PollMapper.toDto(poll));
  }
}
