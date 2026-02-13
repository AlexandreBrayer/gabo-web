<script lang="ts">
	import { login, register } from '../auth.remote';

	let isLogin = $state(true);
</script>

<div class="mx-auto mt-16 max-w-md rounded-lg bg-white p-8 shadow-lg">
	<h1 class="mb-6 text-center text-3xl font-bold text-gray-800">
		{isLogin ? 'Connexion' : 'Inscription'}
	</h1>

	{#if isLogin}
		<!-- Formulaire de connexion -->
		<form {...login} class="space-y-4">
			<div>
				<label for="email" class="mb-1 block text-sm font-medium text-gray-700">Email</label>
				<input
					{...login.fields.email.as('email')}
					id="email"
					class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="votre@email.com"
				/>
				{#each login.fields.email.issues() as issue}
					<p class="mt-1 text-sm text-red-600">{issue.message}</p>
				{/each}
			</div>

			<div>
				<label for="password" class="mb-1 block text-sm font-medium text-gray-700"
					>Mot de passe</label
				>
				<input
					{...login.fields.password.as('password')}
					id="password"
					class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="••••••••"
				/>
				{#each login.fields.password.issues() as issue}
					<p class="mt-1 text-sm text-red-600">{issue.message}</p>
				{/each}
			</div>

			<button
				type="submit"
				disabled={!!login.pending}
				class="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{login.pending ? 'Connexion...' : 'Se connecter'}
			</button>
		</form>
	{:else}
		<!-- Formulaire d'inscription -->
		<form {...register} class="space-y-4">
			<div>
				<label for="name" class="mb-1 block text-sm font-medium text-gray-700">Nom</label>
				<input
					{...register.fields.name.as('text')}
					id="name"
					class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="Votre nom"
				/>
				{#each register.fields.name.issues() as issue}
					<p class="mt-1 text-sm text-red-600">{issue.message}</p>
				{/each}
			</div>

			<div>
				<label for="email-reg" class="mb-1 block text-sm font-medium text-gray-700">Email</label>
				<input
					{...register.fields.email.as('email')}
					id="email-reg"
					class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="votre@email.com"
				/>
				{#each register.fields.email.issues() as issue}
					<p class="mt-1 text-sm text-red-600">{issue.message}</p>
				{/each}
			</div>

			<div>
				<label for="password-reg" class="mb-1 block text-sm font-medium text-gray-700"
					>Mot de passe</label
				>
				<input
					{...register.fields.password.as('password')}
					id="password-reg"
					class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="••••••••"
				/>
				{#each register.fields.password.issues() as issue}
					<p class="mt-1 text-sm text-red-600">{issue.message}</p>
				{/each}
			</div>

			<button
				type="submit"
				disabled={!!register.pending}
				class="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{register.pending ? 'Inscription...' : "S'inscrire"}
			</button>
		</form>
	{/if}

	<!-- Toggle entre login et register -->
	<div class="mt-6 text-center">
		<button
			onclick={() => (isLogin = !isLogin)}
			class="text-sm text-blue-600 transition hover:text-blue-800 hover:underline"
		>
			{isLogin ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
		</button>
	</div>
</div>
