import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument, GetCommandOutput } from '@aws-sdk/lib-dynamodb';
import { NOT_FOUND, POLL } from 'src/modules/user/constant';
import { Result } from 'src/common/core/result';
import {
  generatePollGsi1Pk,
  generatePollPk,
  generatePollSk,
} from 'src/modules/poll/helper';
import { PollMapper } from 'src/modules/poll/mapper/pollMapper';
import { Poll } from 'src/modules/poll/domain/poll';
import { PollRepo, FindByIdOptions } from '../pollRepo';

const ddbclient = new DynamoDBClient({
  region: process.env.APP_REGION,
});
const ddbDoc = DynamoDBDocument.from(ddbclient, {
  marshallOptions: { removeUndefinedValues: true },
});

export class DynamoDbPollRepo implements PollRepo {
  async findOneById(
    id: string,
    options?: FindByIdOptions,
  ): Promise<Result<Poll>> {
    let getResult: GetCommandOutput;

    try {
      getResult = await ddbDoc.get({
        ConsistentRead: options?.consistentRead ? true : false,
        TableName: process.env.TABLE_NAME,
        Key: {
          PK: generatePollPk(id),
          SK: generatePollSk(),
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

    const poll = PollMapper.toEntity(item);

    return Result.ok(poll);
  }

  async find(): Promise<Result<Poll[]>> {
    const polls: Poll[] = [];

    let firstLoad = true;
    let lastEvaluatedKey: Record<string, any> | undefined = undefined;

    try {
      while (firstLoad || lastEvaluatedKey) {
        const queryResult = await ddbDoc.query({
          TableName: process.env.TABLE_NAME,
          KeyConditionExpression: 'GSI2PK = :pk',
          ExpressionAttributeValues: {
            ':pk': POLL,
          },
          IndexName: 'GSI2',
          ScanIndexForward: false,
          ExclusiveStartKey: lastEvaluatedKey,
        });

        const items = queryResult.Items;

        polls.push(...items.map(PollMapper.toEntity));

        firstLoad = false;
        lastEvaluatedKey = queryResult.LastEvaluatedKey;
      }
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }

    return Result.ok(polls);
  }

  async findByUserId(userId: string): Promise<Result<Poll[]>> {
    const polls: Poll[] = [];

    let firstLoad = true;
    let lastEvaluatedKey: Record<string, any> | undefined = undefined;

    while (firstLoad || lastEvaluatedKey) {
      try {
        const queryResult = await ddbDoc.query({
          TableName: process.env.TABLE_NAME,
          KeyConditionExpression: 'GSI1PK = :pk',
          ExpressionAttributeValues: {
            ':pk': generatePollGsi1Pk(userId),
          },
          ScanIndexForward: false,
          IndexName: 'GSI1',
          ExclusiveStartKey: lastEvaluatedKey,
        });

        const items = queryResult.Items;

        polls.push(...items.map(PollMapper.toEntity));

        firstLoad = false;
        lastEvaluatedKey = queryResult.LastEvaluatedKey;
      } catch (error) {
        console.error(error);
        return Result.fail('Unexpected Error');
      }
    }

    return Result.ok(polls);
  }

  async save(poll: Poll): Promise<Result<void>> {
    const promises: Promise<any>[] = [];

    if (poll.unsavedVote) {
      const unsavedVote = poll.unsavedVote;
      // only update vote
      promises.push(
        this.updatePollVoteCount(
          poll.id,
          unsavedVote.option,
          unsavedVote.isOptionNew,
        ),
      );
    } else {
      // create new poll
      promises.push(this.createPoll(poll));
    }

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }

    return Result.ok();
  }

  private async updatePollVoteCount(
    pollId: string,
    option: string,
    isOptionNew: boolean,
  ): Promise<void> {
    let updateExpression: string;

    const expressionAttributeValues = {
      ':one': 1,
    };
    const expressionAttributeNames = {
      '#opt': option,
    };

    if (isOptionNew) {
      updateExpression = `SET voteCountPerOption.#opt = if_not_exists (voteCountPerOption.#opt, :one), voteCount = voteCount + :one, #opts = list_append(#opts, :newOpts)`;
      expressionAttributeNames['#opts'] = 'options';
      expressionAttributeValues[':newOpts'] = [option];
    } else {
      updateExpression = `SET voteCountPerOption.#opt = voteCountPerOption.#opt + :one, voteCount = voteCount + :one`;
    }

    await ddbDoc.update({
      TableName: process.env.TABLE_NAME,
      Key: {
        PK: generatePollPk(pollId),
        SK: generatePollSk(),
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
    });
  }

  private async createPoll(poll: Poll): Promise<void> {
    await ddbDoc.put({
      TableName: process.env.TABLE_NAME,
      Item: PollMapper.toDynamoDbModel(poll),
    });
  }

  async remove(poll: Poll): Promise<Result<void>> {
    try {
      await ddbDoc.delete({
        TableName: process.env.TABLE_NAME,
        Key: {
          PK: generatePollPk(poll.id),
          SK: generatePollSk(),
        },
      });

      return Result.ok();
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }
  }
}
