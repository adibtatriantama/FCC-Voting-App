import { Result } from '$lib/core/result';
import type { UserDto } from '$lib/dto/userDto';
import { AuthServiceImpl } from '$lib/service/impl/authServiceImpl';
import { get, writable } from 'svelte/store';

export const userStore = writable<UserDto | null>(null);

export const loadUser = async (): Promise<Result<void>> => {
	const authService = AuthServiceImpl.getInstance();

	const getUserResult = await authService.getUser();

	if (getUserResult.isSuccess) {
		const user = getUserResult.getValue();
		userStore.set(user);

		return Result.ok();
	} else {
		if (get(userStore)) {
			await logout();
		}

		if (getUserResult.getErrorValue() === 'unauthorized') {
			clearToken();
		}

		return Result.fail('unable to load user');
	}
};

export const logout = async () => {
	userStore.set(null);
	clearToken();
};

export const saveToken = (token: string) => {
	localStorage.setItem('token', token);
};

export const clearToken = () => {
	localStorage.removeItem('token');
};
