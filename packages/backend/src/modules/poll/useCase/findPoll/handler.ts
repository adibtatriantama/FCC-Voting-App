import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { UnexpectedError } from 'src/common/core/useCaseError';
import { DynamoDbPollRepo } from 'src/modules/poll/repo/impl/dynamoDbPollRepo';
import { FindPoll } from './findPoll';

const useCase = new FindPoll(new DynamoDbPollRepo());

export const main: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
) => {
  process.env.BASE_URL = `https://${event.requestContext.domainName}`;

  const response = await useCase.execute();

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
