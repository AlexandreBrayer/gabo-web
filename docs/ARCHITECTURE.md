# Architecture du Projet Gabo

## Vue d'ensemble
Application web de jeu multi-joueurs construite avec SvelteKit, utilisant les remote functions pour une architecture composable.

## Stack Technique

### Frontend
- **Framework**: SvelteKit 2.x avec Svelte 5
- **Remote Functions**: Activées (composable, alternative aux page.server.ts)
- **Styling**: Tailwind CSS 4.x

### Backend
- **Base de données**: SQLite avec Drizzle ORM
- **Authentification**: Better Auth avec email/password
- **WebSockets**: Pour la gestion temps réel des game rooms
- **API**: Remote Functions SvelteKit

### Infrastructure
- **ORM**: Drizzle
- **Adapter**: adapter-auto
- **Tests**: Playwright (E2E), Vitest (Unit)

## Modules Principaux

### 1. Authentification
- **Système**: Better Auth
- **Méthode**: Email/Password
- **Session**: Gérée via cookies SvelteKit
- **Schéma DB**: `user`, `session`, `account` (auth.schema.ts)

### 2. Game Rooms
À implémenter:
- Création de rooms publiques ou privées (avec code)
- Gestion des participants
- WebSocket pour communication temps réel
- Chat intégré dans chaque room

### 3. Remote Functions
Structure privilégiée pour:
- **Queries**: `getPublicRooms`, `getRoom`, `getChatHistory`, `getMyRooms`
- **Commands**: `joinRoom`, `leaveRoom`, `toggleReady`, `startGame`, `sendMessage`
- **Forms**: `createRoom` (avec redirection vers la room créée)

Les remote functions sont dans `src/routes/rooms/rooms.remote.ts` selon la convention SvelteKit.

## Structure des Dossiers

```
src/
├── lib/
│   ├── server/
│   │   ├── auth.ts              # Configuration Better Auth
│   │   ├── db/
│   │   │   ├── index.ts         # Instance Drizzle
│   │   │   ├── schema.ts        # Schémas DB principaux
│   │   │   └── auth.schema.ts   # Schémas Better Auth
│   │   ├── rooms/
│   │   │   └── index.ts         # Logique métier game rooms
│   │   └── websocket/
│   │       └── index.ts         # Gestionnaire WebSocket
│   ├── websocket/
│   │   └── client.ts            # Client WebSocket côté frontend
│   ├── types/
│   │   └── game.ts              # Types TypeScript partagés
│   └── components/              # Composants Svelte
├── routes/
│   ├── +layout.svelte
│   ├── +page.svelte
│   └── rooms/
│       └── rooms.remote.ts      # Remote functions pour les rooms
└── hooks.server.ts              # Middleware Better Auth
```

## Schéma Base de Données

### Tables Existantes
- `user`: Utilisateurs (Better Auth)
- `session`: Sessions (Better Auth)
- `account`: Comptes liés (Better Auth)
- `verification`: Vérifications email (Better Auth)

### Tables à Créer
- `game_room`: Salles de jeu
- `room_participant`: Participants aux rooms
- `chat_message`: Messages chat
- `game_state`: État des parties

## Flux d'Utilisation

1. **Inscription/Connexion** → Better Auth
2. **Créer/Rejoindre Room** → Remote Function
3. **Connexion WebSocket** → Room Channel
4. **Chat + Game** → WebSocket événements
5. **Déconnexion** → Nettoyage session room

## Configuration

### Remote Functions
Activées dans `svelte.config.js`:
```js
experimental: {
  remoteFunctions: true
}
```

### Variables d'Environnement
- `ORIGIN`: URL base de l'application
- `BETTER_AUTH_SECRET`: Secret pour Better Auth
- Database: SQLite local

## Remote Functions Implémentées

### Queries
- `getPublicRooms()`: Liste toutes les rooms publiques
- `getRoom(roomId)`: Détails d'une room spécifique
- `getChatHistory(roomId)`: Historique des messages
- `getMyRooms()`: Rooms de l'utilisateur connecté

### Commands
- `joinRoom(roomIdOrCode)`: Rejoindre une room
- `leaveRoom(roomId)`: Quitter une room
- `toggleReady(roomId)`: Changer son statut ready
- `startGame(roomId)`: Démarrer la partie (owner)
- `sendMessage({ roomId, message })`: Envoyer un message

### Forms
- `createRoom({ name, isPublic, maxPlayers })`: Créer une room

## Utilisation des Remote Functions

```typescript
// Dans un composant Svelte
import { getPublicRooms, joinRoom } from '$routes/rooms/rooms.remote';

// Query avec await
const rooms = await getPublicRooms();

// Command
async function join(roomId: string) {
  await joinRoom(roomId).updates(getPublicRooms());
}
```

## Prochaines Étapes
1. ✅ Documentation architecture
2. ✅ Schémas DB pour game rooms
3. ✅ Remote functions game rooms
4. ✅ Logique métier rooms et chat
5. ✅ Client WebSocket frontend
6. ⏳ Installer dépendances (valibot, ws)
7. ⏳ Intégrer WebSocket dans hooks.server.ts
8. ⏳ Interface utilisateur rooms
