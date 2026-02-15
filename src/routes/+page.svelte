<script lang="ts">
	import { getCurrentUser } from './auth.remote';
	import WelcomeView from '$lib/components/Home/WelcomeView.svelte';
	import DashboardHeader from '$lib/components/Home/DashboardHeader.svelte';
	import RoomsList from '$lib/components/Home/RoomsList.svelte';

	const user = await getCurrentUser();
	
</script>

{#if !user}
	<WelcomeView />
{:else}
	<div class="mx-auto max-w-6xl p-4">
		<DashboardHeader />
		<RoomsList />
	</div>
{/if}
