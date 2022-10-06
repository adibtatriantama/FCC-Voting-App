import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { EntityNotFoundError, UnexpectedError } from 'src/core/useCaseError';
import { DynamoDbPollRepo } from 'src/repo/impl/dynamoDbPollRepo';
import {
  RemovePoll,
  RemovePollRequest,
  UnableToRemovePollError,
} from './removePoll';

const useCase = new RemovePoll(new DynamoDbPollRepo());

export const main: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
) => {
  const { sub: userId } = event.requestContext.authorizer?.jwt.claims;

  const { pollId } = event.pathParameters;

  const request: RemovePollRequest = {
    userId,
    pollId,
  };

  const response = await useCase.execute(request);

  if (response.isRight()) {
    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'ok' }),
    };
  } else {
    const useCaseError = response.value;

    switch (useCaseError.constructor) {
      case UnableToRemovePollError:
        return {
          statusCode: 403,
          body: JSON.stringify({ error: useCaseError.message }),
        };
      case EntityNotFoundError:
        return {
          statusCode: 404,
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
