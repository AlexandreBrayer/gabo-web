<script lang="ts">
	import { login, register } from '../auth.remote';
	import AuthView from '$lib/components/Auth/AuthView.svelte';
</script>

<AuthView loginAction={login} registerAction={register} />
