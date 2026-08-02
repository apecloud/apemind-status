# ApeMind Status

Public status page for ApeMind's Singapore service.

Live page: <https://status.apemind.ai/>

- Web and the API documentation entry are scheduled for external checks every five minutes by GitHub Actions. Scheduled runs may be delayed.
- Chat and Document Processing & Search are maintained manually through incident updates.
- The page is hosted outside the production Kubernetes cluster.

See [OPERATIONS.md](OPERATIONS.md) for the incident workflow.

## Local checks

```sh
npx prettier --check .upptimerc.yml README.md OPERATIONS.md
```

The generated status page is published by the workflows in `.github/workflows/`.
