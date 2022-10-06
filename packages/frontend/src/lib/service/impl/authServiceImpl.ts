import { Result } from '$lib/core/result';
import type { UserDto } from '$lib/dto/userDto';
import type { AuthService } from '../authService';

const baseUrl = import.meta.env.VITE_API_URL;

export class AuthServiceImpl implements AuthService {
	private static _instance: AuthServiceImpl;

	static getInstance(): AuthServiceImpl {
		if (!this._instance) {
			this._instance = new AuthServiceImpl();
		}

		return this._instance;
	}

	async getUser(): Promise<Result<UserDto>> {
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				return Result.fail('no token found');
			}

			const response = await fetch(`${baseUrl}/me`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (response.status === 401) {
				Result.fail('unauthorized');
			}

			const data = await response.json();

			return Result.ok(data);
		} catch (error) {
			console.error(error);
			return Result.fail('unable to get User');
		}
	}
}
