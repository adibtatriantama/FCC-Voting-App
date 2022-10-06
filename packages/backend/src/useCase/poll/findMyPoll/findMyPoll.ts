import { Either, left, right } from 'src/core/either';
import { UseCase } from 'src/core/useCase';
import { UnexpectedError, UseCaseError } from 'src/core/useCaseError';
import { PollMapper } from 'src/mapper/pollMapper';
import { PollDto } from 'src/model/poll';
import { PollRepo } from 'src/repo/pollRepo';

export type FindMyPollRequest = {
  userId: string;
};

export type FindMyPollResponse = Either<UseCaseError, { items: PollDto[] }>;

export class FindMyPoll
  implements UseCase<FindMyPollRequest, FindMyPollResponse>
{
  constructor(private readonly pollRepo: PollRepo) {}

  async execute(request: FindMyPollRequest): Promise<FindMyPollResponse> {
    const findResult = await this.pollRepo.findByUserId(request.userId);

    if (findResult.isFailure) {
      return left(new UnexpectedError());
    }

    const polls = findResult.getValue();

    return right({ items: polls.map(PollMapper.toDto) });
  }
}
