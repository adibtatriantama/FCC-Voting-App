import Dynamo from 'dynamodb-onetable/Dynamo';
import { Table, Entity } from 'dynamodb-onetable';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ONETABLE_SCHEMA } from './schema';

const ddbclient = new DynamoDBClient({
  region: process.env['APP_REGION'],
});

const client = new Dynamo({
  client: ddbclient,
});

export const onetable = new Table({
  name: process.env['TABLE_NAME'],
  schema: ONETABLE_SCHEMA,
  partial: false,
  client,
});

export type UserType = Entity<typeof ONETABLE_SCHEMA.models.User>;
export type PollType = Entity<typeof ONETABLE_SCHEMA.models.Poll>;
