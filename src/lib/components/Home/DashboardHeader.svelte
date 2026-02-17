<script lang="ts">
	import { getCurrentUser, logout } from '$routes/auth.remote';
	import { Button } from '$lib/components/ui/button/index';
	const user = await getCurrentUser();
</script>

{#if !user}
	<!-- This should never happen since this component is only rendered when the user is authenticated -->
	<div class="text-center text-red-500">Erreur : utilisateur non authentifié</div>
{:else}
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Salut, {user.name} !</h1>
			<p>Prêt à jouer ?</p>
		</div>
		<div class="flex gap-4">
			<Button
				href="/rooms/create"
				class="bg-green-600 font-medium text-white hover:bg-green-700"
			>
				+ Créer une partie
			</Button>
			<form {...logout}>
				<Button type="submit" variant="outline" class=" font-medium">Déconnexion</Button>
			</form>
		</div>
	</div>
{/if}
