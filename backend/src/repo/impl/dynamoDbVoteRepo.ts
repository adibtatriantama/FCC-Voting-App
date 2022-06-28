import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { BatchGetCommandOutput, DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { NOT_FOUND } from 'src/constant';
import { Result } from 'src/core/result';
import { generateVotePk, generateVoteSk } from 'src/helper';
import { VoteMapper } from 'src/mapper/voteMapper';
import { PollVote } from 'src/model/poll';
import {
  BatchFindOneVoteParams,
  FindOneVoteParams,
  VoteRepo,
} from '../voteRepo';

const ddbclient = new DynamoDBClient({
  region: process.env.APP_REGION,
});
const ddbDoc = DynamoDBDocument.from(ddbclient, {
  marshallOptions: { removeUndefinedValues: true },
});

export class DynamoDbVoteRepo implements VoteRepo {
  async findOne(params: FindOneVoteParams): Promise<Result<PollVote>> {
    let getResult;

    try {
      getResult = await ddbDoc.get({
        TableName: process.env.TABLE_NAME,
        Key: {
          PK: generateVotePk(params.pollId),
          SK: generateVoteSk(params.userId),
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

    const vote = VoteMapper.toValueObject(item);

    return Result.ok(vote);
  }

  async batchfindOne(
    params: BatchFindOneVoteParams,
  ): Promise<Result<PollVote[]>> {
    let batchGetResult: BatchGetCommandOutput;

    try {
      batchGetResult = await ddbDoc.batchGet({
        RequestItems: {
          [process.env.TABLE_NAME]: {
            Keys: params.map((item) => {
              return {
                PK: generateVotePk(item.pollId),
                SK: generateVoteSk(item.userId),
              };
            }),
          },
        },
      });
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }

    const votes = batchGetResult.Responses[process.env.TABLE_NAME].map(
      (item) => {
        return VoteMapper.toValueObject(item);
      },
    );

    return Result.ok(votes);
  }
}
