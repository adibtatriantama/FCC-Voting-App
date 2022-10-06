import { Either, left, right } from 'src/common/core/either';
import { UseCase } from 'src/common/core/useCase';
import { UnexpectedError, UseCaseError } from 'src/common/core/useCaseError';
import { PollMapper } from 'src/modules/poll/mapper/pollMapper';
import { PollDto } from 'src/modules/poll/domain/poll';
import { PollRepo } from 'src/modules/poll/repo/pollRepo';

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
