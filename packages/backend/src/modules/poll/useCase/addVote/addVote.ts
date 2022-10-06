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

export class UnableToCreateOptionError extends UseCaseError {
  constructor() {
    super(
      'Unable to create option. You must be authenticated to create option.',
    );
  }
}

export type AddVoteRequest = {
  pollId: string;
  option: string;
  isAuthenticated: boolean;
};

export type AddVoteResponse = Either<UseCaseError, PollDto>;

export class AddVote implements UseCase<AddVoteRequest, AddVoteResponse> {
  constructor(private readonly pollRepo: PollRepo) {}

  async execute(request: AddVoteRequest): Promise<AddVoteResponse> {
    const findPollResult = await this.pollRepo.findOneById(request.pollId);

    if (findPollResult.isFailure) {
      switch (findPollResult.getErrorValue()) {
        case NOT_FOUND:
          return left(new EntityNotFoundError());
        default:
          return left(new UnexpectedError());
      }
    }

    const poll = findPollResult.getValue();

    poll.addVote(request.option);

    if (poll.unsavedVote.isOptionNew && !request.isAuthenticated) {
      return left(new UnableToCreateOptionError());
    }

    const saveResult = await this.pollRepo.save(poll);

    if (saveResult.isFailure) {
      return left(new UnexpectedError());
    }

    return right(PollMapper.toDto(poll));
  }
}
