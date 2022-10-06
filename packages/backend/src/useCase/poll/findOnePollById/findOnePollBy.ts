import { NOT_FOUND } from 'src/constant';
import { Either, left, right } from 'src/core/either';
import { UseCase } from 'src/core/useCase';
import {
  EntityNotFoundError,
  UnexpectedError,
  UseCaseError,
} from 'src/core/useCaseError';
import { PollMapper } from 'src/mapper/pollMapper';
import { PollDto } from 'src/model/poll';
import { PollRepo } from 'src/repo/pollRepo';

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
