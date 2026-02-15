<script lang="ts">
	import { page } from '$app/state';

	const roomId = page.params.id!;
</script>

<div class="text-center">
	<h1 class="text-4xl font-bold">Mode Spectateur</h1>
	<p class="mt-4 text-gray-500">Room ID: {roomId}</p>
</div>
