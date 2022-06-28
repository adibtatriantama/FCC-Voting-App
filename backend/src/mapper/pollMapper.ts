import {
  generatePollGsi1Pk,
  generatePollGsi1Sk,
  generatePollGsi2Pk,
  generatePollGsi2Sk,
  generatePollPk,
  generatePollSk,
  removeProperty,
} from 'src/helper';
import { Poll } from 'src/model/poll';

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

  static toDto(poll: Poll): Record<string, any> {
    return {
      date: poll.date.toISOString(),
      id: poll.id,
      ...removeProperty(poll.props, 'date'),
    };
  }

  static toEntity(dto: Record<string, any>): Poll {
    return Poll.create(
      {
        voteCount: dto.voteCount,
        options: dto.options,
        name: dto.name,
        enableOtherOption: dto.enableOtherOption,
        date: new Date(dto.date),
        author: dto.author,
        authorId: dto.authorId,
        voteCountPerOption: dto.voteCountPerOption,
      },
      dto.id,
    ).getValue();
  }
}
