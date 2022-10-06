import { Result } from 'src/common/core/result';
import { Poll } from 'src/modules/poll/domain/poll';

export type FindByIdOptions = {
  consistentRead?: boolean;
};

export interface PollRepo {
  find(): Promise<Result<Poll[]>>;
  findByUserId(userId: string): Promise<Result<Poll[]>>;
  findOneById(id: string, options?: FindByIdOptions): Promise<Result<Poll>>;

  save(poll: Poll): Promise<Result<void>>;
  remove(poll: Poll): Promise<Result<void>>;
}
