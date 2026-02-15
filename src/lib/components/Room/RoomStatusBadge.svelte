<script lang="ts">
	import type { GameRoomWithDetails } from '$lib/types/game';
	import { Badge } from '$lib/components/ui/badge';

	let { status }: { status: GameRoomWithDetails['status'] } = $props();
</script>

<Badge
	variant="outline"
	class="px-4 py-1.5 {status === 'waiting'
		? 'border-yellow-500 text-yellow-600 dark:text-yellow-400'
		: 'border-green-500 text-green-600 dark:text-green-400'}"
>
	{status === 'waiting' ? 'En attente' : 'En cours'}
</Badge>
