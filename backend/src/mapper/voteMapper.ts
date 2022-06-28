import { generateVotePk, generateVoteSk } from 'src/helper';
import { PollVote } from 'src/model/poll';

export class VoteMapper {
  static toDynamoDbModel(vote: PollVote): Record<string, any> {
    return {
      PK: generateVotePk(vote.pollId),
      SK: generateVoteSk(vote.userId),
      option: vote.option,
      date: vote.date.toISOString(),
      pollId: vote.pollId,
      userId: vote.userId,
    };
  }

  static toValueObject(dto: Record<string, any>): PollVote {
    return {
      pollId: dto.pollId,
      userId: dto.userId,
      option: dto.option,
      isOptionNew: false,
      date: new Date(dto.date),
    };
  }
}
