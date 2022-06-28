import { Result } from 'src/core/result';
import { User } from 'src/model/user';

export interface UserRepo {
  findOneById(userId: string): Promise<Result<User>>;

  save(user: User): Promise<Result<void>>;
}
