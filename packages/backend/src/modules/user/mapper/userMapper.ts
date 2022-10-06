import { User, UserDto } from 'src/modules/user/domain/user';
import { generateUserPk, generateUserSk } from '../helper';

export class UserMapper {
  static toDynamoDbModel(user: User): Record<string, any> {
    return {
      PK: generateUserPk(user.id),
      SK: generateUserSk(),
      id: user.id,
      nickname: user.nickname,
      email: user.email,
    };
  }
  static toDto(user: User): UserDto {
    return {
      nickname: user.nickname,
    };
  }

  static toEntity(dto: Record<string, any>): User {
    return User.create(
      {
        nickname: dto.nickname,
        email: dto.email,
      },
      dto.id,
    );
  }
}
