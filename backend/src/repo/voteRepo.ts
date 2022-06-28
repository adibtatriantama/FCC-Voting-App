import { Result } from 'src/core/result';
import { PollVote } from 'src/model/poll';

export type FindOneVoteParams = {
  userId: string;
  pollId: string;
};
export type BatchFindOneVoteParams = {
  userId: string;
  pollId: string;
}[];

export interface VoteRepo {
  findOne(params: FindOneVoteParams): Promise<Result<PollVote>>;
  batchfindOne(params: BatchFindOneVoteParams): Promise<Result<PollVote[]>>;
}
