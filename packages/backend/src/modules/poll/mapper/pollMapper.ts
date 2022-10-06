import {
  generatePollGsi1Pk,
  generatePollGsi1Sk,
  generatePollGsi2Pk,
  generatePollGsi2Sk,
  generatePollPk,
  generatePollSk,
} from 'src/modules/poll/helper';
import { Poll, PollDto } from 'src/modules/poll/domain/poll';

export class PollMapper {
  static toDynamoDbModel(poll: Poll): Record<string, any> {
    return {
      PK: generatePollPk(poll.id),
      SK: generatePollSk(),
      GSI1PK: generatePollGsi1Pk(poll.authorId),
      GSI1SK: generatePollGsi1Sk(poll.id),
      GSI2PK: generatePollGsi2Pk(),
      GSI2SK: generatePollGsi2Sk(poll.date),
      ...PollMapper.toDto(poll),
    };
  }

  static toDto(poll: Poll): PollDto {
    return {
      id: poll.id,
      authorId: poll.authorId,
      author: poll.author,
      name: poll.name,
      options: poll.options,
      voteCount: poll.voteCount,
      voteCountPerOption: poll.voteCountPerOption,
      date: poll.date.toISOString(),
    };
  }

  static toEntity(dto: Record<string, any>): Poll {
    return Poll.create(
      {
        voteCount: dto.voteCount,
        options: dto.options,
        name: dto.name,
        date: new Date(dto.date),
        author: dto.author,
        authorId: dto.authorId,
        voteCountPerOption: dto.voteCountPerOption,
      },
      dto.id,
    ).getValue();
  }
}
