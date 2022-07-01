import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { EntityNotFoundError, UnexpectedError } from 'src/core/useCaseError';
import { decodeVerifyJwt } from 'src/helper/decode-verify-jwt';
import { DynamoDbPollRepo } from 'src/repo/impl/dynamoDbPollRepo';
import { AddVote, AddVoteRequest, UnableToCreateOptionError } from './addVote';

const useCase = new AddVote(new DynamoDbPollRepo());

export const main: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Validation error: option is required',
      }),
    };
  }

  const { pollId } = event.pathParameters;
  const { option } = JSON.parse(event.body);

  if (!option) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Validation error: option is required',
      }),
    };
  }

  // Manually verify JWT, because request can be made both authenticated or unauthenticated
  const token = event.headers['authorization']?.split('Bearer ')[1];
  const isAuthenticated = token
    ? (await decodeVerifyJwt({ token })).isValid
    : false;

  const request: AddVoteRequest = {
    pollId,
    option,
    isAuthenticated,
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
      case UnableToCreateOptionError:
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
