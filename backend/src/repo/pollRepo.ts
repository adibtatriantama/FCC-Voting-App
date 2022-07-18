import { Result } from 'src/core/result';
import { Items } from 'src/model/items';
import { Poll } from 'src/model/poll';

export type QueryOptions = { lastEvaluatedKey?: Record<string, any> };

export type FindByIdOptions = {
  consistentRead?: boolean;
};

export interface PollRepo {
  find(options?: QueryOptions): Promise<Result<Items<Poll>>>;
  findByUserId(
    userId: string,
    options?: QueryOptions,
  ): Promise<Result<Items<Poll>>>;
  findOneById(id: string, options?: FindByIdOptions): Promise<Result<Poll>>;

  save(poll: Poll): Promise<Result<void>>;
  remove(poll: Poll): Promise<Result<void>>;
}
