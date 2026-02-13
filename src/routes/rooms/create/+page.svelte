<script lang="ts">
	import { createRoom } from '../rooms.remote';
	import { getCurrentUser } from '../../auth.remote';
	import { redirect } from '@sveltejs/kit';

	const user = await getCurrentUser();

	if (!user) {
		redirect(307, '/login');
	}
</script>

<div class="mx-auto max-w-2xl p-4">
	<div class="mb-6">
		<a href="/" class="text-blue-600 hover:underline">← Retour à l'accueil</a>
	</div>

	<div class="rounded-lg bg-white p-8 shadow-lg">
		<h1 class="mb-6 text-3xl font-bold text-gray-900">Créer une partie</h1>

		<form {...createRoom} class="space-y-6">
			<!-- Nom de la partie -->
			<div>
				<label for="name" class="mb-1 block text-sm font-medium text-gray-700">
					Nom de la partie
				</label>
				<input
					{...createRoom.fields.name.as('text')}
					id="name"
					placeholder="Ma super partie"
					class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
				{#each createRoom.fields.name.issues() as issue}
					<p class="mt-1 text-sm text-red-600">{issue.message}</p>
				{/each}
			</div>

			<!-- Type de partie (publique/privée) -->
			<div>
				<div class="mb-2 text-sm font-medium text-gray-700">Type de partie</div>
				<div class="flex gap-4">
					<label class="flex cursor-pointer items-center gap-2">
						<input {...createRoom.fields.privacy.as('radio', 'public')} />
						<span class="text-sm text-gray-700">
							Publique
							<span class="block text-xs text-gray-500">Visible par tous les joueurs</span>
						</span>
					</label>
					<label class="flex cursor-pointer items-center gap-2">
						<input {...createRoom.fields.privacy.as('radio', 'private')} />
						<span class="text-sm text-gray-700">
							Privée
							<span class="block text-xs text-gray-500">Accessible uniquement avec un code</span>
						</span>
					</label>
				</div>
				{#each createRoom.fields.privacy.issues() as issue}
					<p class="mt-1 text-sm text-red-600">{issue.message}</p>
				{/each}
			</div>

			<!-- Nombre de joueurs max -->
			<div>
				<label for="maxPlayers" class="mb-1 block text-sm font-medium text-gray-700">
					Nombre maximum de joueurs
				</label>
				<input
					{...createRoom.fields.maxPlayers.as('number')}
					id="maxPlayers"
					min="2"
					max="8"
					class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
				{#each createRoom.fields.maxPlayers.issues() as issue}
					<p class="mt-1 text-sm text-red-600">{issue.message}</p>
				{/each}
				<p class="mt-1 text-xs text-gray-500">Entre 2 et 8 joueurs (défaut: 4)</p>
			</div>

			<!-- Bouton de création -->
			<button
				type="submit"
				disabled={!!createRoom.pending}
				class="w-full rounded-md bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{createRoom.pending ? 'Création...' : 'Créer la partie'}
			</button>
		</form>
	</div>
</div>
