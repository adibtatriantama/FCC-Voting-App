import { onetable, PollType } from 'src/common/infra/db/onetable';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { toUint8Array, fromUint8Array } from 'src/common/helper/parser';

const lambdaClient = new LambdaClient({ region: process.env['APP_REGION'] });
const functionName = process.env['LAMBDA_FUNCTION_NAME_PREFIX'] + 'addVote';

describe('findOnePollById', () => {
  const pollModel = onetable.getModel<PollType>('Poll');
  const previousOptionACount = 30;
  const previousOptionBCount = 20;
  const previousVoteCount = previousOptionACount + previousOptionBCount;

  beforeEach(async () => {
    // Arrange
    await pollModel.create(
      {
        id: 'id',
        name: 'name',
        authorId: 'authorId',
        author: 'author',
        options: ['a', 'b'],
        voteCount: previousVoteCount,
        voteCountPerOption: {
          a: previousOptionACount,
          b: previousOptionBCount,
        },
        date: new Date(),
      },
      { exists: null },
    );
  });

  afterEach(async () => {
    // Clean
    await pollModel.remove({
      id: 'id',
    });
  });

  it('should add the vote', async () => {
    // Act
    const { FunctionError, Payload } = await lambdaClient.send(
      new InvokeCommand({
        FunctionName: functionName,
        Payload: toUint8Array(
          JSON.stringify({
            headers: { Accept: 'application/json' },
            pathParameters: { pollId: 'id' },
            body: JSON.stringify({
              option: 'a',
            }),
            requestContext: {
              domainName: 'test.com',
            },
          }),
        ),
      }),
    );

    // Assert
    const payloadObj = JSON.parse(Payload ? fromUint8Array(Payload) : '{}');
    const pollInDb = await pollModel.get({ id: 'id' });

    expect(FunctionError).toBeUndefined();
    expect(payloadObj.statusCode).toBe(200);
    expect(payloadObj.body).toBeTruthy();
    expect(pollInDb.voteCount).toBe(previousVoteCount + 1);
    expect(pollInDb.voteCountPerOption['a']).toBe(previousOptionACount + 1);
  });

  // Todo
  // With current code, it is hard to test this

  // describe('when given vote option is new', () => {
  //   it('should create new option', async () => {
  // });

  describe('when given poll id is not exist', () => {
    it('should return error 404', async () => {
      // Act
      const { FunctionError, Payload } = await lambdaClient.send(
        new InvokeCommand({
          FunctionName: functionName,
          Payload: toUint8Array(
            JSON.stringify({
              headers: { Accept: 'application/json' },
              pathParameters: { pollId: 'anotherId' },
              body: JSON.stringify({
                option: 'a',
              }),
              requestContext: {
                authorizer: { jwt: { claims: { sub: 'authorId' } } },
                domainName: 'test.com',
              },
            }),
          ),
        }),
      );

      // Assert
      const payloadObj = JSON.parse(Payload ? fromUint8Array(Payload) : '{}');

      expect(FunctionError).toBeUndefined();
      expect(payloadObj.statusCode).toBe(404);
      expect(payloadObj.body).toBeTruthy();
    });
  });
});
