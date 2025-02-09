# Jobar 🏗️

![Temporal](https://temporal.io/images/open-graph/shiny.png)

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

## 💻 Exemple d'utilisation

```typescript
import express from 'express';
import {Jobar} from 'jobar';

const app = express();
const jobar = new Jobar({
	app,
	workflowsPath: './workflows',
	temporalAddress: 'localhost:7233',
});

jobar.run({
	activities: {
		sayHello: async (name: string) => `Hello, ${name}!`,
	},
});

app.listen(3000, () => console.log('Server is running on port 3000'));
```

---

## 🔗 Liens

-   📦 [NPM](https://www.npmjs.com/package/jobar)
-   🐙 [GitHub](https://github.com/william-donnette/jobar)
-   🦊 [GitLab](https://gitlab.com/william-donnette/jobar)

## 📞 Contact

-   👨🏻‍💻 [William Donnette](https://william-donnette.dev/#contact)
