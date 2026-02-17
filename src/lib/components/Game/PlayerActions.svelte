<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer/index';
	import { Button } from '$lib/components/ui/button/index';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import { getGameState } from '$routes/game/gameHandlers.remote';

	interface Props {
		roomId: string;
	}

	let { roomId }: Props = $props();

	let open = $state(false);

	const gameStateQuery = $derived(getGameState(roomId));
	const gameState = $derived(await gameStateQuery);
</script>

<!-- Flèche qui sort du bord de l'écran -->
<button
	onclick={() => (open = true)}
	class="fixed bottom-0 left-1/2 z-50 flex -translate-x-1/2 gap-2 rounded-t-xl bg-primary px-4 py-2 text-primary-foreground shadow-lg transition-all hover:bg-primary/90"
>
	<ChevronUp class="h-6 w-6" /><span>Actions</span>
</button>

<Drawer.Root bind:open shouldScaleBackground>
	<Drawer.Content class="fixed right-0 bottom-0 left-0">
		<div class="mx-auto w-full max-w-lg">
			<!-- Poignée de drag -->
			<Drawer.Header>
				<Drawer.Title>Actions du joueur</Drawer.Title>
			</Drawer.Header>
			<div class="flex flex-row gap-8 p-4 pb-8">
				<Button size="lg" onclick={() => (open = false)}>Dire Gabo</Button>
				<Button size="lg" onclick={() => (open = false)}>Dire Gabo</Button>
			</div>
		</div>
	</Drawer.Content>
</Drawer.Root>
