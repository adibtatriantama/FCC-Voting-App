import { onetable, PollType } from 'src/common/infra/db/onetable';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { toUint8Array, fromUint8Array } from 'src/common/helper/parser';

const lambdaClient = new LambdaClient({ region: process.env['APP_REGION'] });
const functionName = process.env['LAMBDA_FUNCTION_NAME_PREFIX'] + 'findMyPoll';

describe('findMyPoll', () => {
  const pollModel = onetable.getModel<PollType>('Poll');

  beforeAll(async () => {
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

  afterAll(async () => {
    // Clean
    await pollModel.remove({
      id: 'id',
    });
  });

  it('should get the polls', async () => {
    // Act
    const { FunctionError, Payload } = await lambdaClient.send(
      new InvokeCommand({
        FunctionName: functionName,
        Payload: toUint8Array(
          JSON.stringify({
            headers: { Accept: 'application/json' },
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
    expect(payloadObj.statusCode).toBe(200);
    expect(payloadObj.body).toBeTruthy();
  });
});
