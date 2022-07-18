import { Either, left, right } from 'src/core/either';
import { UseCase } from 'src/core/useCase';
import { UnexpectedError, UseCaseError } from 'src/core/useCaseError';
import { PollMapper } from 'src/mapper/pollMapper';
import { createPaginationLinks, PaginationLinks } from 'src/model/pagination';
import { PollDto } from 'src/model/poll';
import { PollRepo } from 'src/repo/pollRepo';

const FIND_MY_POLL_PATH = 'me/poll';

export type FindMyPollRequest = {
  userId: string;
  queryOptions: Record<string, any>;
};

export type FindMyPollResponse = Either<
  UseCaseError,
  { items: PollDto[]; _links: PaginationLinks }
>;

export class FindMyPoll
  implements UseCase<FindMyPollRequest, FindMyPollResponse>
{
  constructor(private readonly pollRepo: PollRepo) {}

  async execute(request: FindMyPollRequest): Promise<FindMyPollResponse> {
    const findResult = await this.pollRepo.findByUserId(
      request.userId,
      request.queryOptions,
    );

    if (findResult.isFailure) {
      return left(new UnexpectedError());
    }

    const findResultValue = findResult.getValue();

    const { items: polls, paginationQueryParams } = findResultValue;

    return right({
      items: polls.map(PollMapper.toDto),
      _links: createPaginationLinks(FIND_MY_POLL_PATH, paginationQueryParams),
    });
  }
}
