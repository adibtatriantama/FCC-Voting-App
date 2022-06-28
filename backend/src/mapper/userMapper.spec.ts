import { User } from 'src/model/user';
import { UserMapper } from './userMapper';

describe('UserMapper', () => {
  describe('toDynamoDbModel', () => {
    it('should map correctly', () => {
      const user = User.create(
        {
          nickname: 'tester',
        },
        'tester1',
      );
      const result = UserMapper.toDynamoDbModel(user);

      expect(result).toStrictEqual({
        PK: 'u#tester1',
        SK: 'metadata',
        id: 'tester1',
        nickname: 'tester',
      });
    });
  });

  describe('toDto', () => {
    it('should map correctly', () => {
      const user = User.create(
        {
          nickname: 'tester',
        },
        'tester1',
      );

      const result = UserMapper.toDto(user);

      expect(result).toStrictEqual({
        nickname: 'tester',
      });
    });
  });

  describe('toEntity', () => {
    it('should map correctly', () => {
      const dto = {
        PK: 'u#tester1',
        SK: 'metadata',
        id: 'tester1',
        nickname: 'tester',
      };

      const result = UserMapper.toEntity(dto);

      expect(result).toEqual(
        User.create(
          {
            nickname: 'tester',
          },
          'tester1',
        ),
      );
    });
  });
});
