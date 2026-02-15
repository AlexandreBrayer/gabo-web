<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	interface Props {
		formAction: any;
	}

	let { formAction }: Props = $props();
</script>

<form {...formAction} class="space-y-4">
	<div>
		<label for="email" class="mb-1 block text-sm font-medium">Email</label>
		<Input {...formAction.fields.email.as('email')} id="email" placeholder="votre@email.com" />
		{#each formAction.fields.email.issues() as issue}
			<p class="mt-1 text-sm text-red-600">{issue.message}</p>
		{/each}
	</div>

	<div>
		<label for="password" class="mb-1 block text-sm font-medium">Mot de passe</label>
		<Input {...formAction.fields.password.as('password')} id="password" placeholder="••••••••" />
		{#each formAction.fields.password.issues() as issue}
			<p class="mt-1 text-sm text-red-600">{issue.message}</p>
		{/each}
	</div>

	<Button type="submit" disabled={!!formAction.pending} class="w-full">
		{formAction.pending ? 'Connexion...' : 'Se connecter'}
	</Button>
</form>
