# Jobar 🏗️

![Temporal](https://platformatory.io/blog/assets/blog-images/Introduction-to-temporal/temporal_logo.png)

**Jobar** est une bibliothèque TypeScript permettant d'orchestrer des workflows avec [Temporal](https://temporal.io/) et de les exposer facilement via une API Express.

---

## 🚀 Installation

```sh
npm install jobar
# ou
yarn add jobar
```

---

## 📌 Fonctionnalités

-   🌐 Connexion simplifiée à Temporal
-   🔄 Gestion des workflows et des activités
-   📡 Exposition des tâches en API REST avec Express
-   📝 Journalisation intégrée avec Winston

---

## 📷 Aperçu du Dashboard Temporal

![Temporal Dashboard](https://miro.medium.com/v2/resize:fit:2000/1*piyH9uLZ6ooYCkv6XqBTQA.png)

---

## 📌 Concepts Clés

### Task

Une **Task** représente une unité de travail associée à un workflow Temporal. Elle peut être configurée avec diverses options et exposée via une API Express.

#### Options disponibles :

| Option                 | Type                                      | Description                                                                                                                               |
| ---------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `workflowStartOptions` | `WorkflowStartOptions`                    | Options de démarrage du workflow [Voir la doc associée](https://docs.temporal.io/develop/typescript/core-application#workflow-parameters) |
| `setWorkflowId`        | `(req: Request) => string`                | Fonction pour définir un identifiant unique de workflow basé sur la requête                                                               |
| `isExposed`            | `boolean`                                 | Indique si la tâche doit être exposée via une API Express                                                                                 |
| `method`               | `'get', 'post', 'put', 'patch', 'delete'` | Méthode HTTP de l'endpoint `Obligatoire si isExposed est à true`                                                                          |
| `endpoint`             | `string`                                  | URL de l'endpoint `Obligatoire si isExposed est à true`                                                                                   |
| `prefixUrl`            | `string`                                  | Préfixe de l'URL de l'endpoint `Default: /tasks`                                                                                          |

#### Exemple d'utilisation :

```typescript
import {Request} from 'express';
import {Task} from 'jobar';
import {login} from '../workflows';

const exampleTask = new Task(login, {
	setWorkflowId: (req: Request) => `workflow-login-${req.body.username}`,
	isExposed: true,
	method: 'post',
	endpoint: 'login',
});
```

---

### TaskQueue

Une **TaskQueue** est une file d'attente regroupant plusieurs `Task`. Chaque queue est associée à un `Worker` qui exécute les workflows.

#### Options disponibles :

| Option              | Type                           | Description                                                                                                                                                                |
| ------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getDataConverter`  | `() => Promise<DataConverter>` | Permet d'utiliser un convertisseur de données personnalisé (ex: chiffrement) [Voir la doc associée](https://docs.temporal.io/develop/typescript/converters-and-encryption) |
| `connectionOptions` | `ConnectionOptions`            | Options de connexion à Temporal [Voir la doc associée](https://docs.temporal.io/develop/typescript/core-application#connect-to-temporal-cloud)                             |
| `clientOptions`     | `ClientOptions`                | Options du client Temporal [Voir la doc associée](https://docs.temporal.io/develop/typescript/core-application#connect-to-a-dev-cluster)                                   |

#### Exemple d'utilisation :

```typescript
import {TaskQueue, getDataConverter} from 'jobar';

const exampleTaskQueue = new TaskQueue('example', {
	getDataConverter, // Chiffrement des données pour Temporal Codec par défaut
}).addTask(exampleTask);
```

---

### Jobar

**Jobar** est le moteur central qui orchestre les workflows, connecte les workers à Temporal, et expose les tâches en API Express.

#### Options disponibles :

| Option                   | Type      | Description                                                                 |
| ------------------------ | --------- | --------------------------------------------------------------------------- |
| `app`                    | `Express` | Instance de l'application Express                                           |
| `workflowsPath`          | `string`  | Chemin des workflows                                                        |
| `temporalAddress`        | `string`  | Adresse du serveur Temporal                                                 |
| `logger`                 | `Logger`  | Instance de Winston pour la journalisation `Défaut: Logger Winston default` |
| `logLevel`               | `string`  | Niveau de journalisation (`debug`, `info`, `error`, etc.) `Défaut: debug`   |
| `namespace`              | `string`  | Namespace utilisé dans Temporal `Défaut: default`                           |
| `defaultStatusCodeError` | `number`  | Code HTTP d'erreur par défaut `Défaut: 500`                                 |

#### Exemple d'utilisation :

```typescript
import express from 'express';
import Jobar from 'jobar';
import exampleTaskQueue from './tasks/example';
import activities from './activities';

const app = express();
app.use(express.json());

const jobar = new Jobar({
	app,
	workflowsPath: require.resolve('./workflows'),
	temporalAddress: 'localhost:7233',
});

jobar.addTaskQueue(exampleTaskQueue).run({activities});

app.listen(3000, () => console.log('Server running on port 3000'));
```

## 📂 Structure de projet conseillé

Vous pouvez utiliser ce modèle tel un framework

```
your-project/
├── src/
│   ├── activities/     # Gestion des activités
│   ├── tasks/          # Gestion des tâches et files d'attente
│   ├── workflows/      # Gestion des workflows
│   |   └── index.ts    # Exportez tous vos workflows visibles par l'option `workflowsPath`
│   └── index.ts        # Point d'entrée
```

## 💻 Exemple d'utilisation

Retrouvez des exemples sur le repo officiel [🔗 Github Examples](https://github.com/william-donnette/jobar/tree/main/examples)

## 🔗 Liens

-   📦 [NPM](https://www.npmjs.com/package/jobar)
-   🐙 [GitHub](https://github.com/william-donnette/jobar)
-   🐙 [GitHub Examples](https://github.com/william-donnette/jobar/tree/main/examples)
-   🦊 [GitLab](https://gitlab.com/william-donnette/jobar)

## 📞 Contact

-   👨🏻‍💻 [William Donnette](https://william-donnette.dev/#contact)
