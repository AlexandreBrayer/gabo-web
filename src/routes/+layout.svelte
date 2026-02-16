<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';
	import ToggleButton from '$lib/components/ModeWatcher/ToggleButton.svelte';
	let { children } = $props();
	import { Toaster } from '$lib/components/ui/sonner/index.js';

</script>


<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<ModeWatcher />
<Toaster />
<div class="min-h-screen bg-background">
	<header class="border-b bg-card">
		<div class="container mx-auto flex items-center justify-between px-6 py-4">
			<a href="/" class="flex items-center gap-2">
				<h1 class="text-2xl font-bold text-foreground">Gabo</h1>
			</a>
			<ToggleButton />
		</div>
	</header>
	<main class="container mx-auto px-6 py-6">{@render children()}</main>
</div>
