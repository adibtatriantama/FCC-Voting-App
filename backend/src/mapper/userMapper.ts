import { generateUserPk, generateUserSk } from 'src/helper';
import { User, UserDto } from 'src/model/user';

export class UserMapper {
  static toDynamoDbModel(user: User): Record<string, any> {
    return {
      PK: generateUserPk(user.id),
      SK: generateUserSk(),
      id: user.id,
      nickname: user.nickname,
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
      },
      dto.id,
    );
  }
}
