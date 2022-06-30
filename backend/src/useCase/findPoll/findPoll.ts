import { Either, left, right } from 'src/core/either';
import { UseCase } from 'src/core/useCase';
import { UnexpectedError, UseCaseError } from 'src/core/useCaseError';
import { PollMapper } from 'src/mapper/pollMapper';
import { createPaginationLinks, PaginationLinks } from 'src/model/pagination';
import { PollDto } from 'src/model/poll';
import { PollRepo } from 'src/repo/pollRepo';

const FIND_POLL_PATH = 'poll';

export type FindPollRequest = { queryOptions: Record<string, any> };

export type FindPollResponse = Either<
  UseCaseError,
  { items: PollDto[]; _links: PaginationLinks }
>;

export class FindPoll implements UseCase<FindPollRequest, FindPollResponse> {
  constructor(private readonly pollRepo: PollRepo) {}

  async execute(request: FindPollRequest): Promise<FindPollResponse> {
    const findResult = await this.pollRepo.find(request.queryOptions);

    if (findResult.isFailure) {
      return left(new UnexpectedError());
    }

    const findResultValue = findResult.getValue();

    const { items: polls, paginationQueryParams } = findResultValue;

    return right({
      items: polls.map(PollMapper.toDto),
      _links: createPaginationLinks(FIND_POLL_PATH, paginationQueryParams),
    });
  }
}
