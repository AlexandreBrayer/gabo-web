<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import { login } from '$routes/auth.remote';
	import { isHttpError } from '@sveltejs/kit';
</script>

<form {...login.enhance(async ({ submit }) => {
	try {
		await submit();
		if (login.result === undefined) {
			return
		} 
		toast.success('Connexion réussie !');
	} catch (error) {
		if (isHttpError(error)) {
			toast.error(error.body.message);
		} else {
			toast.error('Erreur de connexion');
		}
	}
})} class="space-y-4">
	<div>
		<label for="email" class="mb-1 block text-sm font-medium">Email</label>
		<Input {...login.fields.email.as('email')} id="email" placeholder="votre@email.com" autocomplete="email" />
		{#each login.fields.email.issues() as issue}
			<p class="mt-1 text-sm text-red-600">{issue.message}</p>
		{/each}
	</div>

	<div>
		<label for="password" class="mb-1 block text-sm font-medium">Mot de passe</label>
		<Input {...login.fields.password.as('password')} id="password" placeholder="••••••••" autocomplete="current-password" />
		{#each login.fields.password.issues() as issue}
			<p class="mt-1 text-sm text-red-600">{issue.message}</p>
		{/each}
	</div>

	<Button type="submit" disabled={!!login.pending} class="w-full">
		{login.pending ? 'Connexion...' : 'Se connecter'}
	</Button>
</form>
