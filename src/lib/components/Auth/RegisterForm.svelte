<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import { register } from '$routes/auth.remote';
	import { isHttpError } from '@sveltejs/kit';
</script>

<form
	{...register.enhance(async ({ submit, form }) => {
		try {
			await submit();
			form.reset();
			toast.success('Inscription réussie !');
		} catch (error) {
			if (isHttpError(error)) {
				toast.error(error.body.message);
			} else {
				toast.error("Erreur d'inscription");
			}
		}
	})}
	class="space-y-4"
>
	<div>
		<label for="name" class="mb-1 block text-sm font-medium">Nom</label>
		<Input {...register.fields.name.as('text')} id="name" placeholder="Votre nom" autocomplete="name" />
		{#each register.fields.name.issues() as issue}
			<p class="mt-1 text-sm text-red-600">{issue.message}</p>
		{/each}
	</div>

	<div>
		<label for="email-reg" class="mb-1 block text-sm font-medium">Email</label>
		<Input {...register.fields.email.as('email')} id="email-reg" placeholder="votre@email.com" autocomplete="email" />
		{#each register.fields.email.issues() as issue}
			<p class="mt-1 text-sm text-red-600">{issue.message}</p>
		{/each}
	</div>

	<div>
		<label for="password-reg" class="mb-1 block text-sm font-medium">Mot de passe</label>
		<Input {...register.fields.password.as('password')} id="password-reg" placeholder="••••••••" autocomplete="new-password" />
		{#each register.fields.password.issues() as issue}
			<p class="mt-1 text-sm text-red-600">{issue.message}</p>
		{/each}
	</div>

	<Button type="submit" class="w-full" disabled={!!register.pending}>
		{register.pending ? 'Inscription...' : "S'inscrire"}
	</Button>
</form>
