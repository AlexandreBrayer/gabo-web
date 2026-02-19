<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer/index';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import {
		getGameState,
		getTwoFirstCards,
		setReady,
		setNotReady
	} from '$routes/game/gameHandlers.remote';
	import PlayerAction from './PlayerAction.svelte';
	import { getCurrentUser } from '$routes/auth.remote';

	interface Props {
		roomId: string;
	}

	let { roomId }: Props = $props();

	let open = $state(false);

	const gameStateQuery = $derived(getGameState(roomId));
	const gameState = $derived(await gameStateQuery);
	const user = await getCurrentUser();

	const isUserReady = $derived.by(() => {
		const mat = gameState.mats.find((m) => m.userId === user!.id);
		return mat ? mat.isReady : false;
	});

	async function handleShowTwoFirstCards() {
		const newGameState = await getTwoFirstCards(roomId);
		gameStateQuery.set(newGameState);
		open = false;
	}
	function handleSetReady() {
		setReady(roomId);
		open = false;
	}

	function handleSetNotReady() {
		setNotReady(roomId);
		open = false;
	}
</script>

<!-- Flèche qui sort du bord de l'écran -->
<button
	onclick={() => (open = true)}
	class="fixed bottom-0 left-1/2 z-50 flex -translate-x-1/2 gap-2 rounded-t-xl bg-primary px-4 py-2 text-primary-foreground shadow-lg transition-all hover:bg-primary/90"
>
	<ChevronUp class="h-6 w-6" /><span>Actions</span>
</button>

<Drawer.Root bind:open shouldScaleBackg(round>
	<Drawer.Content class="fixed right-0 bottom-0 left-0">
		<div class="mx-auto w-full">
			<!-- Poignée de drag -->
			<Drawer.Header>
				<Drawer.Title>Actions du joueur</Drawer.Title>
			</Drawer.Header>
			<div class="flex flex-row gap-8 p-6">
				{#if gameState.game.status === 'starting'}
					{#if isUserReady}
						<PlayerAction label="Annuler prêt" onclick={handleSetNotReady} />
					{:else}
						<PlayerAction label="Prêt" onclick={handleSetReady} />
					{/if}
					<PlayerAction label="Voir mes 2 premières cartes" onclick={handleShowTwoFirstCards} />
				{/if}
			</div>
		</div>
	</Drawer.Content>
</Drawer.Root>
