import { onetable, PollType } from 'src/common/infra/db/onetable';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { toUint8Array, fromUint8Array } from 'src/common/helper/parser';

const lambdaClient = new LambdaClient({ region: process.env['APP_REGION'] });
const functionName = process.env['LAMBDA_FUNCTION_NAME_PREFIX'] + 'removePoll';

describe('removePoll', () => {
  const pollModel = onetable.getModel<PollType>('Poll');

  beforeEach(async () => {
    // Arrange
    await pollModel.create(
      {
        id: 'id',
        name: 'name',
        authorId: 'authorId',
        author: 'author',
        options: ['a', 'b'],
        voteCount: 50,
        voteCountPerOption: {
          a: 30,
          b: 20,
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

  it('should remove the poll', async () => {
    // Act
    const { FunctionError, Payload } = await lambdaClient.send(
      new InvokeCommand({
        FunctionName: functionName,
        Payload: toUint8Array(
          JSON.stringify({
            headers: { Accept: 'application/json' },
            pathParameters: { pollId: 'id' },
            requestContext: {
              domainName: 'test.com',
              authorizer: { jwt: { claims: { sub: 'authorId' } } },
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
    expect(pollInDb).toBeUndefined();
  });

  describe('when trying to remove poll from different author', () => {
    it('should return status code 403', async () => {
      // Act
      const { FunctionError, Payload } = await lambdaClient.send(
        new InvokeCommand({
          FunctionName: functionName,
          Payload: toUint8Array(
            JSON.stringify({
              headers: { Accept: 'application/json' },
              pathParameters: { pollId: 'id' },
              requestContext: {
                domainName: 'test.com',
                authorizer: { jwt: { claims: { sub: 'differentAuthor' } } },
              },
            }),
          ),
        }),
      );

      // Assert
      const payloadObj = JSON.parse(Payload ? fromUint8Array(Payload) : '{}');

      expect(FunctionError).toBeUndefined();
      expect(payloadObj.statusCode).toBe(403);
      expect(payloadObj.body).toBeTruthy();
    });
  });

  describe('when given poll id is not exist', () => {
    it('should return status code 404', async () => {
      // Act
      const { FunctionError, Payload } = await lambdaClient.send(
        new InvokeCommand({
          FunctionName: functionName,
          Payload: toUint8Array(
            JSON.stringify({
              headers: { Accept: 'application/json' },
              pathParameters: { pollId: 'not exist' },
              requestContext: {
                domainName: 'test.com',
                authorizer: { jwt: { claims: { sub: 'authorId' } } },
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
