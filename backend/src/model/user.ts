export type UserProps = {
  nickname: string;
  email: string;
};

export type UserDto = Omit<UserProps, 'email'>;

export class User {
  private constructor(
    public readonly props: UserProps,
    public readonly id: string,
  ) {}

  static create(props: UserProps, id: string): User {
    return new User(props, id);
  }

  get nickname(): string {
    return this.props.nickname;
  }

  get email(): string {
    return this.props.email;
  }
}
