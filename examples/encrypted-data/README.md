## 🚀 Installation

:warning: Nécessite Docker d'installer pour la conteneurisation de temporal

```sh
docker compose up -d

npm install
# ou
yarn install

npm run dev
# ou
npm run build
npm run start
```

Cela devrait vous ouvrir plusieurs ports:

-   Le Dashboard Temporal UI [http://localhost:8082](http://localhost:8082/namespaces/default/workflows)
-   Une API Express [localhost:3000](localhost:3000)
    -   Cette API contient un endpoint [localhost:3000/tasks/login](localhost:3000/tasks/login) sur lequel vous pouvez tester des requêtes POST.

Vous pouvez tester cet endpoint avec la commande suivante:

```sh
curl --location 'localhost:3000/tasks/login' --header 'Content-Type: application/json' --data '{"username": "Temporal", "password": "temporal"}'
```

Vous pouvez ensuite vous rendre sur le Dashboard Temporal UI pour voir votre activité

## Explication

C'est dans la TaskQueue que l'instanciation du cryptage se fait et permet d'utiliser un convertisseur de données personnalisé (ex: chiffrement) [Voir la doc associée](https://docs.temporal.io/develop/typescript/converters-and-encryption)

```typescript
import {TaskQueue, getDataConverter} from 'jobar';

const exampleTaskQueue = new TaskQueue('example', {
	getDataConverter, // Chiffrement des données pour Temporal Codec par défaut
}).addTask(exampleTask);
```
