import { Result } from 'src/common/core/result';
import { ulid } from 'ulid';

export type PollVote = {
  option: string;
  isOptionNew: boolean;
  date: Date;
};

export type PollProps = {
  authorId: string;
  author: string;
  name: string;
  options: string[];
  voteCountPerOption?: Record<string, number>;
  voteCount?: number;
  date: Date;
};

export type PollDto = Required<
  Omit<PollProps, 'date'> & { id: string; date: string }
>;

export class Poll {
  readonly isNew: boolean;
  private _unsavedVote: PollVote;

  private constructor(
    public readonly props: PollProps,
    public readonly id: string,
  ) {
    if (!id) {
      this.id = ulid();
      this.isNew = true;
    } else {
      this.isNew = false;
    }
  }

  static create(props: PollProps, id?: string): Result<Poll> {
    if (!props.name) {
      return Result.fail("Poll name shouln't be empty");
    }

    if (props.options.length < 2) {
      return Result.fail(
        'Poll should have minimum 2 options. Add more options!',
      );
    }

    let voteCountPerOption = props.voteCountPerOption;
    let voteCount = props.voteCount ?? 0;
    if (!voteCountPerOption) {
      voteCountPerOption = {};
      for (const option of props.options) {
        voteCountPerOption[option] = 0;
      }
      voteCount = 0;
    }

    return Result.ok(new Poll({ ...props, voteCount, voteCountPerOption }, id));
  }

  get authorId(): string {
    return this.props.authorId;
  }

  get author(): string {
    return this.props.author;
  }

  get name(): string {
    return this.props.name;
  }

  get options(): string[] {
    return this.props.options;
  }

  get voteCount(): number {
    return this.props.voteCount;
  }

  get voteCountPerOption(): Record<string, number> {
    return this.props.voteCountPerOption;
  }

  get date(): Date {
    return this.props.date;
  }

  get unsavedVote(): PollVote {
    return this._unsavedVote;
  }

  addVote(option: string): Result<void> {
    if (this._unsavedVote) {
      return Result.fail('Only able to save one vote at a time');
    }

    const isOptionExist = this.options.includes(option);

    if (!isOptionExist) {
      this.props.options.push(option);
    }

    this._unsavedVote = {
      isOptionNew: !isOptionExist,
      date: new Date(),
      option,
    };

    this.calculateVoteCount();

    return Result.ok();
  }

  private calculateVoteCount() {
    if (this._unsavedVote.isOptionNew) {
      this.props.voteCountPerOption[this._unsavedVote.option] = 1;
    } else {
      this.props.voteCountPerOption[this._unsavedVote.option]++;
    }

    let voteCount = 0;

    for (const key in this.props.voteCountPerOption) {
      voteCount += this.props.voteCountPerOption[key];
    }

    this.props.voteCount = voteCount;
  }
}
