<script lang="ts">
	import { getCurrentUser } from './auth.remote';
	import { logout } from './auth.remote';
	import { getPublicRooms } from './rooms/rooms.remote';

	const user = await getCurrentUser();
	const rooms = await getPublicRooms();
</script>

{#if !user}
	<div class="mx-auto mt-16 max-w-2xl text-center">
		<h1 class="mb-4 text-5xl font-bold text-gray-900">Bienvenue sur Gabo</h1>
		<p class="mb-8 text-xl text-gray-600">
			Le jeu de cartes multi-joueurs en ligne. Créez des parties et défiez vos amis !
		</p>
		<a
			href="/login"
			class="inline-block rounded-md bg-blue-600 px-8 py-3 text-lg font-medium text-white transition hover:bg-blue-700"
		>
			Commencer à jouer
		</a>
	</div>
{:else}
	<div class="mx-auto max-w-6xl p-4">
		<!-- Header avec user info -->
		<div class="mb-8 flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold text-gray-900">Salut, {user.name} !</h1>
				<p class="text-gray-600">Prêt à jouer ?</p>
			</div>
			<div class="flex gap-4">
				<a
					href="/rooms/create"
					class="rounded-md bg-green-600 px-6 py-2 font-medium text-white transition hover:bg-green-700"
				>
					+ Créer une partie
				</a>
				<form {...logout}>
					<button
						class="rounded-md bg-gray-200 px-6 py-2 font-medium text-gray-700 transition hover:bg-gray-300"
					>
						Déconnexion
					</button>
				</form>
			</div>
		</div>

		<!-- Liste des parties publiques -->
		<div>
			<h2 class="mb-4 text-2xl font-bold text-gray-800">Parties publiques</h2>

			{#if rooms.length === 0}
				<div class="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
					<p class="text-gray-500">Aucune partie publique pour le moment.</p>
					<p class="mt-2 text-sm text-gray-400">Soyez le premier à en créer une !</p>
				</div>
			{:else}
				<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each rooms as room}
						<a
							href="/rooms/{room.id}"
							class="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
						>
							<div class="mb-3 flex items-start justify-between">
								<h3 class="text-lg font-semibold text-gray-900">{room.name}</h3>
								<span
									class="rounded-full px-2 py-1 text-xs font-medium"
									class:bg-yellow-100={room.status === 'waiting'}
									class:text-yellow-800={room.status === 'waiting'}
									class:bg-green-100={room.status === 'playing'}
									class:text-green-800={room.status === 'playing'}
									class:bg-gray-100={room.status === 'finished'}
									class:text-gray-800={room.status === 'finished'}
								>
									{room.status === 'waiting'
										? 'En attente'
										: room.status === 'playing'
											? 'En cours'
											: 'Terminée'}
								</span>
							</div>

							<div class="mb-3 text-sm text-gray-600">
								<p>Créée par : {room.owner.name}</p>
								<p>
									Joueurs : {room.participantCount} / {room.maxPlayers}
								</p>
							</div>

							<div class="flex items-center gap-2">
								{#each room.participants.slice(0, 3) as participant}
									<div
										class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-xs font-medium text-white"
										title={participant.user.name}
									>
										{participant.user.name.charAt(0).toUpperCase()}
									</div>
								{/each}
								{#if room.participants.length > 3}
									<div
										class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-xs font-medium text-gray-700"
									>
										+{room.participants.length - 3}
									</div>
								{/if}
							</div>

							{#if room.participantCount >= room.maxPlayers}
								<p class="mt-3 text-sm text-red-600">Partie pleine</p>
							{/if}
						</a>
					{/each}
				</div>
			{/if}

			<!-- Bouton refresh -->
			<button
				onclick={() => getPublicRooms().refresh()}
				class="mt-4 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
			>
				🔄 Actualiser
			</button>
		</div>
	</div>
{/if}
