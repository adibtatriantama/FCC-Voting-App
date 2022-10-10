import { onetable, UserType } from 'src/common/infra/db/onetable';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { toUint8Array } from 'src/common/helper/parser';

const lambdaClient = new LambdaClient({ region: process.env['APP_REGION'] });
const functionName = process.env['LAMBDA_FUNCTION_NAME_PREFIX'] + 'createUser';

describe('createUser', () => {
  const userModel = onetable.getModel<UserType>('User');

  afterEach(async () => {
    // Clean
    await userModel.remove({
      id: 'username',
    });
  });

  it('should save user in db', async () => {
    // Act
    const { FunctionError } = await lambdaClient.send(
      new InvokeCommand({
        FunctionName: functionName,
        Payload: toUint8Array(
          JSON.stringify({
            triggerSource: 'PostConfirmation_ConfirmSignUp',
            userName: 'username',
            request: {
              userAttributes: {
                email: 'test@mail.com',
                nickname: 'nickname',
              },
            },
          }),
        ),
      }),
    );

    // Assert
    const userInDb = await userModel.get({ id: 'username' });

    expect(FunctionError).toBeUndefined();
    expect(userInDb).toBeTruthy();
  });
});
