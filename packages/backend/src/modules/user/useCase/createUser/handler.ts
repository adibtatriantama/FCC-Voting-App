import {
  PostConfirmationTriggerEvent,
  PostConfirmationTriggerHandler,
} from 'aws-lambda';
import { DynamoDbUserRepo } from 'src/modules/user/repo/impl/dynamoDbUserRepo';
import { CreateUser } from './createUser';

const useCase = new CreateUser(new DynamoDbUserRepo());

export const main: PostConfirmationTriggerHandler = async (
  event: PostConfirmationTriggerEvent,
) => {
  if (event.triggerSource === 'PostConfirmation_ConfirmSignUp') {
    const username = event.userName;
    const { nickname, email } = event.request.userAttributes;

    const useCaseResponse = await useCase.execute({
      id: username,
      nickname,
      email,
    });

    if (useCaseResponse.isLeft()) {
      console.error(useCaseResponse.value.message);
    }
  }

  return event;
};
