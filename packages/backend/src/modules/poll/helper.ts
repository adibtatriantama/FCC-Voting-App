import { METADATA, POLL } from './constant';

export const generateUserPk = (userId: string) => `u#${userId}`;
export const generateUserSk = () => METADATA;
export const generatePollPk = (pollId: string) => `p#${pollId}`;
export const generatePollSk = () => METADATA;
export const generatePollGsi1Pk = generateUserPk;
export const generatePollGsi1Sk = generatePollPk;
export const generatePollGsi2Pk = () => POLL;
export const generatePollGsi2Sk = (date: Date) => date.toISOString();
export const generateVotePk = generatePollPk;
export const generateVoteSk = (userId: string) => `pv#${userId}`;

export const removeProperty = (
  obj: Record<string, any>,
  propertyName: string,
) => {
  const { [propertyName]: _, ...result } = obj;
  return result;
};
