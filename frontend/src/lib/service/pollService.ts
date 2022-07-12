import type { Result } from '$lib/core/result';
import type { UserDto } from '$lib/dto/userDto';

export interface AuthService {
	logout(): Promise<Result<void>>;
}
