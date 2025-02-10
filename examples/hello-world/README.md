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
    -   Cette API contient un endpoint [localhost:3000/tasks/helloWorld](localhost:3000/tasks/helloWorld) sur lequel vous pouvez tester des requêtes POST.

Vous pouvez tester cet endpoint avec la commande suivante:

```sh
curl --location 'localhost:3000/tasks/helloWorld' --header 'Content-Type: application/json' --data '{"name": "Temporal"}'
```

Vous pouvez ensuite vous rendre sur le Dashboard Temporal UI pour voir votre activité
