import { Either, left, right } from 'src/core/either';
import { UseCase } from 'src/core/useCase';
import { UnexpectedError, UseCaseError } from 'src/core/useCaseError';
import { PollMapper } from 'src/mapper/pollMapper';
import { Poll, PollDto, PollProps } from 'src/model/poll';
import { PollRepo } from 'src/repo/pollRepo';

export class PollCreationError extends UseCaseError {
  constructor(message: string) {
    super('Poll creation error, ' + message);
  }
}

export type CreatePollRequest = PollProps;

export type CreatePollResponse = Either<UseCaseError, PollDto>;

export class CreatePoll
  implements UseCase<CreatePollRequest, CreatePollResponse>
{
  constructor(private readonly pollRepo: PollRepo) {}

  async execute(request: CreatePollRequest): Promise<CreatePollResponse> {
    const pollCreationResult = Poll.create(request);

    if (pollCreationResult.isFailure) {
      return left(new PollCreationError(pollCreationResult.getErrorValue()));
    }

    const poll = pollCreationResult.getValue();

    const saveResult = await this.pollRepo.save(poll);

    if (saveResult.isFailure) {
      return left(new UnexpectedError());
    }

    return right(PollMapper.toDto(poll));
  }
}
