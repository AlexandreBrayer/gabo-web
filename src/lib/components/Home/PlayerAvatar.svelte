<script lang="ts">
	interface Props {
		name: string;
	}

	let { name }: Props = $props();
    const initial = $derived(name.charAt(0).toUpperCase());
</script>

<div
	class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-xs font-medium text-white"
	title={name}
>
	{initial}
</div>
