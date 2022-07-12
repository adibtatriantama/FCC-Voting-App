import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { EntityNotFoundError, UnexpectedError } from 'src/core/useCaseError';
import { DynamoDbUserRepo } from 'src/repo/impl/dynamoDbUserRepo';
import { FindUserById } from './findUserById';

const useCase = new FindUserById(new DynamoDbUserRepo());

export const main: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
) => {
  const { sub: request } = event.requestContext.authorizer?.jwt.claims;

  const response = await useCase.execute(request);

  if (response.isRight()) {
    return {
      statusCode: 200,
      body: JSON.stringify(response.value),
    };
  } else {
    const useCaseError = response.value;

    switch (useCaseError.constructor) {
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
