import { Either, left, right } from 'src/common/core/either';
import { UseCase } from 'src/common/core/useCase';
import { UnexpectedError, UseCaseError } from 'src/common/core/useCaseError';
import { PollMapper } from 'src/modules/poll/mapper/pollMapper';
import { PollDto } from 'src/modules/poll/domain/poll';
import { PollRepo } from 'src/modules/poll/repo/pollRepo';

export type FindPollRequest = void;

export type FindPollResponse = Either<UseCaseError, { items: PollDto[] }>;

export class FindPoll implements UseCase<FindPollRequest, FindPollResponse> {
  constructor(private readonly pollRepo: PollRepo) {}

  async execute(): Promise<FindPollResponse> {
    const findResult = await this.pollRepo.find();

    if (findResult.isFailure) {
      return left(new UnexpectedError());
    }

    const findResultValue = findResult.getValue();

    const polls = findResultValue;

    return right({ items: polls.map(PollMapper.toDto) });
  }
}
