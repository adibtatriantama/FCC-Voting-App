import { Poll } from './poll';

describe('Poll', () => {
  describe('create', () => {
    const defaultProps = {
      author: 'tester',
      authorId: 'testerId',
      name: 'poll',
      options: ['a', 'b'],
      voteCount: 3,
      voteCountPerOption: { a: 1, b: 2 },
      enableOtherOption: false,
      date: new Date(),
    };
    it('should return Poll', () => {
      const createPollResult = Poll.create(defaultProps);

      expect(createPollResult.isSuccess).toBe(true);
    });

    describe('when name is empty', () => {
      it('should return failure', () => {
        const createPollResult = Poll.create({ ...defaultProps, name: '' });

        expect(createPollResult.isFailure).toBe(true);
      });
    });

    describe('when poll option count is less than 2', () => {
      it('should return failure', () => {
        const createPollResult = Poll.create({
          ...defaultProps,
          options: ['a'],
        });

        expect(createPollResult.isFailure).toBe(true);
      });
    });

    describe('when poll vote count per option is empty', () => {
      it('should populate vote count', () => {
        const createPollResult = Poll.create({
          author: 'tester',
          authorId: 'testerId',
          name: 'poll',
          options: ['a', 'b'],
          date: new Date(),
        });

        expect(createPollResult.getValue().voteCountPerOption).toStrictEqual({
          a: 0,
          b: 0,
        });
        expect(createPollResult.getValue().voteCount).toBe(0);
      });
    });
  });

  describe('addVote', () => {
    let poll: Poll;

    beforeEach(() => {
      poll = Poll.create({
        author: 'tester',
        authorId: 'testerId',
        name: 'poll',
        options: ['a', 'b'],
        voteCount: 100,
        voteCountPerOption: {
          a: 71,
          b: 29,
        },
        date: new Date(),
      }).getValue();
    });

    it('should addVote', () => {
      poll.addVote('a');

      expect(poll.unsavedVote).toBeDefined();
    });

    it('should update vote count', () => {
      poll.addVote('a');

      expect(poll.voteCount).toBe(101);
      expect(poll.voteCountPerOption['a']).toBe(72);
    });

    describe("when option isn't exist", () => {
      beforeEach(() => {
        poll = Poll.create({
          author: 'tester',
          authorId: 'testerId',
          name: 'poll',
          options: ['a', 'b'],
          voteCount: 100,
          voteCountPerOption: {
            a: 71,
            b: 29,
          },
          date: new Date(),
        }).getValue();
      });

      it('should add vote', () => {
        poll.addVote('c');

        expect(poll.unsavedVote).toBeDefined();
      });

      it('should flag that the option is new', () => {
        poll.addVote('c');

        expect(poll.unsavedVote.isOptionNew).toBe(true);
      });

      it('should update vote count', () => {
        poll.addVote('c');

        expect(poll.voteCount).toBe(101);
        expect(poll.voteCountPerOption['c']).toBe(1);
      });
    });

    describe('when vote existing option', () => {
      it('should not flag that the option is new', () => {
        poll.addVote('b');

        expect(poll.unsavedVote.isOptionNew).toBe(false);
      });
    });

    describe('when unsaved vote already exist', () => {
      it('should return failure', () => {
        poll.addVote('b');

        const result = poll.addVote('b');

        expect(result.isFailure).toBe(true);
      });
    });
  });
});
