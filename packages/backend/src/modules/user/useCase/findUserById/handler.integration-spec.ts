import { onetable, UserType } from 'src/common/infra/db/onetable';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { fromUint8Array, toUint8Array } from 'src/common/helper/parser';

const lambdaClient = new LambdaClient({ region: process.env['APP_REGION'] });
const functionName = process.env['LAMBDA_FUNCTION_NAME_PREFIX'] + 'findOwnUser';

describe('findUserById', () => {
  const userModel = onetable.getModel<UserType>('User');

  beforeAll(async () => {
    // Arrange
    await userModel.create(
      {
        id: 'id',
        email: 'test@mail.com',
        nickname: 'nickname',
      },
      { exists: null },
    );
  });

  afterAll(async () => {
    // Clean
    await userModel.remove({
      id: 'id',
    });
  });

  it('should get the item', async () => {
    // Act
    const { FunctionError, Payload } = await lambdaClient.send(
      new InvokeCommand({
        FunctionName: functionName,
        Payload: toUint8Array(
          JSON.stringify({
            headers: { Accept: 'application/json' },
            version: '2.0',
            requestContext: {
              http: { method: 'GET' },
              authorizer: { jwt: { claims: { sub: 'id' } } },
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

  describe('when given user id is not exist', () => {
    it('should return status code 404', async () => {
      // Act
      const { FunctionError, Payload } = await lambdaClient.send(
        new InvokeCommand({
          FunctionName: functionName,
          Payload: toUint8Array(
            JSON.stringify({
              headers: { Accept: 'application/json' },
              version: '2.0',
              requestContext: {
                http: { method: 'GET' },
                authorizer: { jwt: { claims: { sub: 'notExistId' } } },
              },
            }),
          ),
        }),
      );

      // Assert
      const payloadObj = JSON.parse(Payload ? fromUint8Array(Payload) : '{}');

      expect(FunctionError).toBeUndefined();
      expect(payloadObj.statusCode).toBe(404);
    });
  });
});
