import { Result } from 'src/common/core/result';
import { User } from 'src/modules/user/domain/user';

export interface UserRepo {
  findOneById(userId: string): Promise<Result<User>>;

  save(user: User): Promise<Result<void>>;
}
