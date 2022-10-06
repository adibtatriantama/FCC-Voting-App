export type PollDto = {
	id: string;
	authorId: string;
	author: string;
	name: string;
	options: string[];
	voteCountPerOption?: Record<string, number>;
	voteCount?: number;
	date: string;
};
