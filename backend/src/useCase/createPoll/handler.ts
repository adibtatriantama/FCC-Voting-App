import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { UnexpectedError } from 'src/core/useCaseError';
import { DynamoDbPollRepo } from 'src/repo/impl/dynamoDbPollRepo';
import { DynamoDbUserRepo } from 'src/repo/impl/dynamoDbUserRepo';
import { CreatePoll, CreatePollRequest, PollCreationError } from './createPoll';

const useCase = new CreatePoll(new DynamoDbPollRepo(), new DynamoDbUserRepo());

export const main: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
) => {
  const { sub: authorId } = event.requestContext.authorizer?.jwt.claims;

  const { name, options } = JSON.parse(event.body);

  if (!name || !options) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Validation error: name, options, enableOtherOption is required',
      }),
    };
  }

  const request: CreatePollRequest = {
    date: new Date(),
    authorId,
    name,
    options,
  };

  const response = await useCase.execute(request);

  if (response.isRight()) {
    return {
      statusCode: 200,
      body: JSON.stringify(response.value),
    };
  } else {
    const useCaseError = response.value;

    switch (useCaseError.constructor) {
      case PollCreationError:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: useCaseError.message }),
        };

      case UnexpectedError:
      default:
        return {
          statusCode: 500,
          body: JSON.stringify({ error: useCaseError.message }),
        };
    }
  }
};
