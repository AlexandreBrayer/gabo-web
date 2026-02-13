/**
 * Remote Functions pour l'authentification
 */

import * as v from 'valibot';
import { error, redirect } from '@sveltejs/kit';
import { form, query } from '$app/server';
import { auth } from '$lib/server/auth';
import { getRequestEvent } from '$app/server';
import { APIError } from 'better-auth';

/**
 * Récupérer l'utilisateur connecté
 */
export const getCurrentUser = query(async () => {
	const { locals } = getRequestEvent();
	return locals.user ?? null;
});

/**
 * Formulaire de connexion
 */
export const login = form(
	v.object({
		email: v.pipe(v.string(), v.email('Email invalide')),
		password: v.pipe(v.string(), v.minLength(6, 'Le mot de passe doit faire au moins 6 caractères'))
	}),
	async ({ email, password }) => {
		try {
			await auth.api.signInEmail({
				body: {
					email,
					password,
					callbackURL: '/auth/verification-success'
				}
			});
		} catch (err) {
			if (err instanceof APIError) {
				throw error(400, err.message || 'Échec de la connexion');
			}
			throw error(500, 'Erreur inattendue');
		}

		redirect(303, '/');
	}
);

/**
 * Formulaire d'inscription
 */
export const register = form(
	v.object({
		name: v.pipe(v.string(), v.minLength(2, 'Le nom doit faire au moins 2 caractères')),
		email: v.pipe(v.string(), v.email('Email invalide')),
		password: v.pipe(v.string(), v.minLength(6, 'Le mot de passe doit faire au moins 6 caractères'))
	}),
	async ({ name, email, password }) => {
		try {
			await auth.api.signUpEmail({
				body: {
					name,
					email,
					password,
					callbackURL: '/auth/verification-success'
				}
			});
		} catch (err) {
			if (err instanceof APIError) {
				throw error(400, err.message || 'Échec de l\'inscription');
			}
			throw error(500, 'Erreur inattendue');
		}

		redirect(303, '/');
	}
);

/**
 * Déconnexion
 */
export const logout = form(
	v.object({}),
	async () => {
		const { request } = getRequestEvent();

		await auth.api.signOut({
			headers: request.headers
		});

		redirect(303, '/login');
	}
);
