import { NOT_FOUND } from 'src/constant';
import { Either, left, right } from 'src/core/either';
import { UseCase } from 'src/core/useCase';
import {
  EntityNotFoundError,
  UnexpectedError,
  UseCaseError,
} from 'src/core/useCaseError';
import { PollRepo } from 'src/repo/pollRepo';

export type RemovePollRequest = {
  pollId: string;
  userId: string;
};

export class UnableToRemovePollError extends UseCaseError {
  constructor(message: string) {
    super(`Unable to remove poll: ${message}`);
  }
}

export type RemovePollResponse = Either<UseCaseError, void>;

export class RemovePoll
  implements UseCase<RemovePollRequest, RemovePollResponse>
{
  constructor(private readonly pollRepo: PollRepo) {}

  async execute(request: RemovePollRequest): Promise<RemovePollResponse> {
    const getPollResult = await this.pollRepo.findOneById(request.pollId);

    if (getPollResult.isFailure) {
      switch (getPollResult.getErrorValue()) {
        case NOT_FOUND:
          return left(new EntityNotFoundError());
        default:
          return left(new UnexpectedError());
      }
    }

    const poll = getPollResult.getValue();

    if (poll.authorId !== request.userId) {
      return left(new UnableToRemovePollError('You are not the author'));
    }

    const removeResult = await this.pollRepo.remove(poll);

    if (removeResult.isFailure) {
      return left(new UnexpectedError());
    }

    return right(undefined);
  }
}
