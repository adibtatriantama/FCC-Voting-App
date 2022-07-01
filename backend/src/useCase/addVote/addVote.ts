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
