import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocument,
  GetCommandOutput,
  QueryCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import { NOT_FOUND, POLL } from 'src/constant';
import { Result } from 'src/core/result';
import { generatePollGsi1Pk, generatePollPk, generatePollSk } from 'src/helper';
import { PollMapper } from 'src/mapper/pollMapper';
import { VoteMapper } from 'src/mapper/voteMapper';
import { Items } from 'src/model/items';
import { PaginationQueryParams } from 'src/model/pagination';
import { Poll, PollVote } from 'src/model/poll';
import { QueryOptions, PollRepo, FindByIdOptions } from '../pollRepo';

const ddbclient = new DynamoDBClient({
  region: process.env.APP_REGION,
});
const ddbDoc = DynamoDBDocument.from(ddbclient, {
  marshallOptions: { removeUndefinedValues: true },
});
const LIMIT = 10;

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

  async find(option?: QueryOptions): Promise<Result<Items<Poll>>> {
    let queryResult: QueryCommandOutput;

    try {
      queryResult = await ddbDoc.query({
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: 'GSI2PK = :pk',
        ExpressionAttributeValues: {
          ':pk': POLL,
        },
        IndexName: 'GSI2',
        ScanIndexForward: false,
        Limit: LIMIT,
        ExclusiveStartKey: option?.lastEvaluatedKey,
      });
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }

    const items = queryResult.Items;

    const paginationQueryParams: PaginationQueryParams = {
      next: queryResult?.LastEvaluatedKey
        ? `lastEvaluatedKey=${encodeURIComponent(
            JSON.stringify(queryResult.LastEvaluatedKey),
          )}`
        : undefined,
    };

    const polls: Poll[] = items.map((item): Poll => {
      return PollMapper.toEntity(item);
    });

    return Result.ok({ paginationQueryParams, items: polls });
  }

  async findByUserId(
    userId: string,
    option?: QueryOptions,
  ): Promise<Result<Items<Poll>>> {
    let queryResult: QueryCommandOutput;

    try {
      queryResult = await ddbDoc.query({
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: {
          ':pk': generatePollGsi1Pk(userId),
        },
        ScanIndexForward: false,
        IndexName: 'GSI1',
        Limit: LIMIT,
        ExclusiveStartKey: option?.lastEvaluatedKey,
      });
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }

    const items = queryResult.Items;

    const paginationQueryParams: PaginationQueryParams = {
      next: queryResult?.LastEvaluatedKey
        ? `lastEvaluatedKey=${encodeURIComponent(
            JSON.stringify(queryResult.LastEvaluatedKey),
          )}`
        : undefined,
    };

    const polls: Poll[] = items.map((item): Poll => {
      return PollMapper.toEntity(item);
    });

    return Result.ok({ paginationQueryParams, items: polls });
  }

  async save(poll: Poll): Promise<Result<void>> {
    const promises: Promise<any>[] = [];

    if (poll.unsavedVote) {
      const unsavedVote = poll.unsavedVote;
      // only update vote
      promises.push(this.createVote(unsavedVote));
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

  private async createVote(vote: PollVote): Promise<void> {
    await ddbDoc.put({
      TableName: process.env.TABLE_NAME,
      Item: VoteMapper.toDynamoDbModel(vote),
    });
  }

  private async updatePollVoteCount(
    pollId: string,
    option: string,
    isOptionNew: boolean,
  ): Promise<void> {
    let updateExpression: string;

    if (isOptionNew) {
      updateExpression = `SET voteCountPerOption.${option} = if_not_exists (voteCountPerOption.${option}, :one), voteCount = voteCount + :one`;
    } else {
      updateExpression = `SET voteCountPerOption.${option} = voteCountPerOption.${option} + :one, voteCount = voteCount + :one`;
    }

    await ddbDoc.update({
      TableName: process.env.TABLE_NAME,
      Key: {
        PK: generatePollPk(pollId),
        SK: generatePollSk(),
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: {
        ':one': 1,
      },
    });
  }

  private async createPoll(poll: Poll): Promise<void> {
    await ddbDoc.put({
      TableName: process.env.TABLE_NAME,
      Item: PollMapper.toDynamoDbModel(poll),
    });
  }
}
