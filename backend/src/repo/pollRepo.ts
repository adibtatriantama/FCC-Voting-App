import { Result } from 'src/core/result';
import { Poll } from 'src/model/poll';

export type QueryOptions = { lastEvaluatedKey: string };
export type FindByIdOptions = {
  consistentRead?: boolean;
};

export interface PollRepo {
  find(options?: QueryOptions): Promise<Result<Poll[]>>;
  findByUserId(userId: string, options?: QueryOptions): Promise<Result<Poll[]>>;
  findOneById(id: string, options?: FindByIdOptions): Promise<Result<Poll>>;

  save(poll: Poll): Promise<Result<void>>;
}
