# Examples

## Hello World

### 🚀 Installation

:warning: Requires Docker for Temporal containerization

You can test it easily with **Docker**:

```sh
npm create jobar-app@latest my-app -- --template=hello-world
cd my-app && docker compose up -d
```

This should open several ports:

-   Temporal Dashboard UI [http://localhost:8082](http://localhost:8082/namespaces/default/workflows)
-   An Express API [localhost:3333](localhost:3333)
    -   This API has an endpoint [localhost:3333/tasks/helloWorld](localhost:3333/tasks/helloWorld) where you can test POST requests.

You can test this endpoint using the following command:

```sh
curl --location 'localhost:3333/tasks/helloWorld' --header 'Content-Type: application/json' --data '{"name": "Temporal"}'
```

You can then visit the Temporal Dashboard UI to view your activity.

---

## 📷 Hello World Workflow on Temporal Dashboard

![Temporal Dashboard](./img/dashboard-workflow-hello-world.png)
