<script lang="ts">
	import './doc.css';
	import { resolve } from '$app/paths';
	let { children } = $props();
</script>

<div class="mx-auto max-w-4xl px-6 py-10">
	<nav class="mb-8 text-sm text-gray-500">
		<a href={resolve('/doc')} class="hover:underline">Docs</a>
	</nav>
	<article class="prose prose-slate dark:prose-invert max-w-none">
		{@render children()}
	</article>
</div>
