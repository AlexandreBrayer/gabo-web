<script lang="ts">
	import type { Component } from 'svelte';
	import { Button, type ButtonVariant } from '$lib/components/ui/button/index';

	interface Props {
		icon?: Component;
		label: string;
		onclick: () => void;
		disabled?: boolean;
		variant?: ButtonVariant;
	}

	let { icon, label, onclick, disabled = false, variant = 'default' }: Props = $props();
</script>

<Button {onclick} {disabled} {variant} class="flex w-full items-center gap-2">
	{#if icon}
		{@const Icon = icon}
		<Icon class="h-5 w-5" />
	{/if}
	<span>{label}</span>
</Button>
