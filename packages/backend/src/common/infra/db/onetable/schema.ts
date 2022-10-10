export const ONETABLE_SCHEMA = {
  format: 'onetable:1.1.0',
  version: '0.0.1',
  indexes: {
    primary: { hash: 'PK', sort: 'SK' },
    gsi1: { hash: 'GSI1PK', sort: 'GSI1SK' },
    gsi2: { hash: 'GSI2PK', sort: 'GSI2SK' },
  },
  models: {
    User: {
      PK: { type: String, value: 'u#${id}' },
      SK: { type: String, value: 'metadata' },
      id: { type: String, required: true },
      email: { type: String, required: true },
      nickname: { type: String, required: true },
    },
    Poll: {
      PK: { type: String, value: 'p#${id}' },
      SK: { type: String, value: 'metadata' },
      GSI1PK: { type: String, value: 'u#${authorId}' },
      GSI1SK: { type: String, value: 'p#${id}' },
      GSI2PK: { type: String, value: 'POLL' },
      GSI2SK: { type: String, value: '${date}' },
      id: { type: String, required: true },
      name: { type: String, required: true },
      authorId: { type: String, required: true },
      author: { type: String, required: true },
      options: { type: Array, required: true },
      voteCount: { type: Number, required: true },
      voteCountPerOption: { type: Object, required: true },
      date: { type: Date, required: true },
    },
  } as const,
  params: {
    isoDates: true,
  },
};
