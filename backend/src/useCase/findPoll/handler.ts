import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { UnexpectedError } from 'src/core/useCaseError';
import { DynamoDbPollRepo } from 'src/repo/impl/dynamoDbPollRepo';
import { FindPoll, FindPollRequest } from './findPoll';

const useCase = new FindPoll(new DynamoDbPollRepo());

export const main: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
) => {
  process.env.BASE_URL = `https://${event.requestContext.domainName}`;

  const { lastEvaluatedKey } = event.queryStringParameters || {};

  const request: FindPollRequest = {
    lastEvaluatedKey: lastEvaluatedKey
      ? JSON.parse(lastEvaluatedKey)
      : undefined,
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
      case UnexpectedError:
      default:
        return {
          statusCode: 500,
          body: JSON.stringify({ error: useCaseError.message }),
        };
    }
  }
};
