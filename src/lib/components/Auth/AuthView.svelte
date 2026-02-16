<script lang="ts">
	import LoginForm from '$lib/components/Auth/LoginForm.svelte';
	import RegisterForm from '$lib/components/Auth/RegisterForm.svelte';
	import * as Card from '$lib/components/ui/card/index.js';

	let isLogin = $state(true);
</script>

<div class="mx-auto mt-16 max-w-md">
	<Card.Root>
		<Card.Header>
			<Card.Title class="text-center text-3xl">
				{isLogin ? 'Connexion' : 'Inscription'}
			</Card.Title>
		</Card.Header>
		<Card.Content>
			{#if isLogin}
				<LoginForm />
			{:else}
				<RegisterForm />
			{/if}

			<!-- Toggle entre login et register -->
			<div class="mt-6 text-center">
				<button
					onclick={() => (isLogin = !isLogin)}
					class="text-sm text-blue-600 hover:underline"
				>
					{isLogin ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
				</button>
			</div>
		</Card.Content>
	</Card.Root>
</div>
