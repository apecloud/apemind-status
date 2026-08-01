# ApeMind Status

Public status page for ApeMind's Singapore service.

- Web and the API documentation entry are checked externally every five minutes by GitHub Actions.
- Chat and Document Processing & Search are maintained manually through incident updates.
- The page is hosted outside the production Kubernetes cluster.

See [OPERATIONS.md](OPERATIONS.md) for the incident workflow.

## Local checks

```sh
npx prettier --check .upptimerc.yml README.md OPERATIONS.md
```

The generated status page is published by the workflows in `.github/workflows/`.
