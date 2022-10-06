import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { NOT_FOUND } from 'src/modules/user/constant';
import { Result } from 'src/common/core/result';
import { generateUserPk, generateUserSk } from '../../helper';
import { UserMapper } from 'src/modules/user/mapper/userMapper';
import { User } from 'src/modules/user/domain/user';
import { UserRepo } from '../userRepo';

const ddbclient = new DynamoDBClient({
  region: process.env.APP_REGION,
});
const ddbDoc = DynamoDBDocument.from(ddbclient, {
  marshallOptions: { removeUndefinedValues: true },
});

export class DynamoDbUserRepo implements UserRepo {
  async findOneById(userId: string): Promise<Result<User>> {
    let getResult;

    try {
      getResult = await ddbDoc.get({
        TableName: process.env.TABLE_NAME,
        Key: {
          PK: generateUserPk(userId),
          SK: generateUserSk(),
        },
      });
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }

    const item = getResult.Item;

    if (!item) {
      return Result.fail(NOT_FOUND);
    }

    const user = UserMapper.toEntity(item);

    return Result.ok(user);
  }

  async save(user: User): Promise<Result<void>> {
    try {
      await ddbDoc.put({
        TableName: process.env.TABLE_NAME,
        Item: UserMapper.toDynamoDbModel(user),
      });
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }

    return Result.ok();
  }
}
