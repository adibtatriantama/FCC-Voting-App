import { Either, left, right } from 'src/common/core/either';
import { UseCase } from 'src/common/core/useCase';
import { UnexpectedError, UseCaseError } from 'src/common/core/useCaseError';
import { PollMapper } from 'src/modules/poll/mapper/pollMapper';
import { Poll, PollDto, PollProps } from 'src/modules/poll/domain/poll';
import { PollRepo } from 'src/modules/poll/repo/pollRepo';
import { UserRepo } from 'src/modules/user/repo/userRepo';

export class PollCreationError extends UseCaseError {
  constructor(message: string) {
    super('Poll creation error, ' + message);
  }
}

export type CreatePollRequest = Omit<PollProps, 'author'>;

export type CreatePollResponse = Either<UseCaseError, PollDto>;

export class CreatePoll
  implements UseCase<CreatePollRequest, CreatePollResponse>
{
  constructor(
    private readonly pollRepo: PollRepo,
    private readonly userRepo: UserRepo,
  ) {}

  async execute(request: CreatePollRequest): Promise<CreatePollResponse> {
    const getUserResult = await this.userRepo.findOneById(request.authorId);

    if (getUserResult.isFailure) {
      return left(new UnexpectedError());
    }

    const user = getUserResult.getValue();

    const pollCreationResult = Poll.create({
      author: user.nickname,
      ...request,
    });

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
