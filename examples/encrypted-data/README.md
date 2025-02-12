# Examples

## Encrypted Data

### 🚀 Installation

:warning: Requires Docker for Temporal containerization

You can test it easily with **Docker**:

```sh
npm create jobar-app@latest my-app -- --template=encrypted-data
cd my-app && docker compose up -d
```

This should open several ports:

-   Temporal Dashboard UI [http://localhost:8082](http://localhost:8082/namespaces/default/workflows)
-   An Express API [localhost:3333](localhost:3333)
    -   This API has an endpoint [localhost:3333/tasks/login](localhost:3333/tasks/login) where you can test POST requests.

You can test this endpoint using the following command:

```sh
curl --location 'localhost:3333/tasks/login' --header 'Content-Type: application/json' --data '{"username": "Temporal", "password": "temporal"}'
```

You can then visit the Temporal Dashboard UI to view your encoded activity.
