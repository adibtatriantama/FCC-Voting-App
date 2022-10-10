import { onetable, PollType, UserType } from 'src/common/infra/db/onetable';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { fromUint8Array, toUint8Array } from 'src/common/helper/parser';

const lambdaClient = new LambdaClient({ region: process.env['APP_REGION'] });
const functionName = process.env['LAMBDA_FUNCTION_NAME_PREFIX'] + 'createPoll';

describe('createPoll', () => {
  const pollModel = onetable.getModel<PollType>('Poll');
  const userModel = onetable.getModel<UserType>('User');

  beforeAll(async () => {
    // Arrange

    await userModel.create(
      {
        id: 'authorId',
        email: 'test@mail.com',
        nickname: 'nickname',
      },
      { exists: null },
    );
  });

  afterEach(async () => {
    // Clean
    await userModel.remove({
      id: 'authorId',
    });
  });

  it('should save poll in db', async () => {
    // Act
    const { FunctionError, Payload } = await lambdaClient.send(
      new InvokeCommand({
        FunctionName: functionName,
        Payload: toUint8Array(
          JSON.stringify({
            headers: { Accept: 'application/json' },
            body: JSON.stringify({
              name: 'Poll name',
              options: ['a', 'b'],
            }),
            requestContext: {
              authorizer: { jwt: { claims: { sub: 'authorId' } } },
            },
          }),
        ),
      }),
    );

    // Assert
    const payloadObj = JSON.parse(Payload ? fromUint8Array(Payload) : '{}');
    const savedId = JSON.parse(payloadObj.body).id;

    expect(FunctionError).toBeUndefined();
    expect(payloadObj.statusCode).toBe(200);
    expect(payloadObj.body).toBeTruthy();
    expect(savedId).toBeTruthy();

    const pollInDb = await pollModel.get({
      id: savedId,
    });
    expect(pollInDb).toBeTruthy();

    // Clean
    await pollModel.remove({ id: savedId });
  });
});
