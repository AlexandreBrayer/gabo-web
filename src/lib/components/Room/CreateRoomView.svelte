<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { createRoom } from '$routes/rooms/rooms.remote';
</script>

<Card.Root class="mx-auto max-w-2xl px-4 py-6">
	<Card.Header>
		<Card.Title class="text-3xl">Créer une partie</Card.Title>
	</Card.Header>
	<Card.Content>
		<form {...createRoom} class="space-y-6">
			<!-- Nom de la partie -->
			<div>
				<label for="name" class="mb-1 block text-sm font-medium"> Nom de la partie </label>
				<Input {...createRoom.fields.name.as('text')} id="name" placeholder="Ma super partie" />
				{#each createRoom.fields.name.issues() as issue}
					<p class="mt-1 text-sm text-red-600">{issue.message}</p>
				{/each}
			</div>

			<!-- Type de partie (publique/privée) -->
			<div>
				<div class="mb-2 text-sm font-medium">Type de partie</div>
				<div class="flex gap-4">
					<label class="flex cursor-pointer items-center gap-2">
						<input {...createRoom.fields.privacy.as('radio', 'public')} />
						<span class="text-sm">
							Publique
							<span class="block text-xs ">Visible par tous les joueurs</span>
						</span>
					</label>
					<label class="flex items-center gap-2">
						<input {...createRoom.fields.privacy.as('radio', 'private')} />
						<span class="text-sm">
							Privée
							<span class="block text-xs ">Accessible uniquement avec un code</span>
						</span>
					</label>
				</div>
				{#each createRoom.fields.privacy.issues() as issue}
					<p class="mt-1 text-sm text-red-600">{issue.message}</p>
				{/each}
			</div>

			<!-- Nombre de joueurs max -->
			<div>
				<label for="maxPlayers" class="mb-1 block text-sm font-medium">
					Nombre maximum de joueurs
				</label>
				<Input {...createRoom.fields.maxPlayers.as('number')} id="maxPlayers" min="2" max="8" />
				{#each createRoom.fields.maxPlayers.issues() as issue}
					<p class="mt-1 text-sm text-red-600">{issue.message}</p>
				{/each}
				<p class="mt-1 text-xs ">Entre 2 et 8 joueurs</p>
			</div>

			<!-- Bouton de création -->
			<Button
				type="submit"
				disabled={!!createRoom.pending}
				class="w-full"
			>
				{createRoom.pending ? 'Création...' : 'Créer la partie'}
			</Button>
		</form>
	</Card.Content>
</Card.Root>
