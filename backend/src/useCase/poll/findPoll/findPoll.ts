import { Either, left, right } from 'src/core/either';
import { UseCase } from 'src/core/useCase';
import { UnexpectedError, UseCaseError } from 'src/core/useCaseError';
import { PollMapper } from 'src/mapper/pollMapper';
import { PollDto } from 'src/model/poll';
import { PollRepo } from 'src/repo/pollRepo';

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
