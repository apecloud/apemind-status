# Status Page Operations

## Components

| Component                    | Source                                                   | Public state |
| ---------------------------- | -------------------------------------------------------- | ------------ |
| Web                          | External HTTP check of `https://app.apemind.ai/`         | Automatic    |
| API                          | External HTTP check of `https://app.apemind.ai/api/docs` | Automatic    |
| Chat                         | On-call verification and incident updates                | Manual       |
| Document Processing & Search | On-call verification and incident updates                | Manual       |

The public page must not include namespaces, Pod names, database names, customer identifiers, credentials, or raw logs.

## Automated incidents

Upptime checks Web and API every five minutes. A failed check opens or updates a GitHub issue and a successful check closes the automated incident. Before communicating customer impact, the on-call engineer confirms the result from a second network path and checks whether the affected user journey is actually unavailable.

## Manual incidents

1. Confirm the affected public component and the user-visible impact.
2. Open an issue using the incident template.
3. Publish a short update with the start time, affected component, impact, and next update time. Do not include internal topology or customer data.
4. Update the incident when impact or mitigation changes.
5. Confirm recovery from an external path before closing the incident.
6. Add a final recovery note and link the internal postmortem only when that document is safe for public access.

## Maintenance

Announce planned maintenance before the window. Include only the affected public component, expected impact, start time, and expected end time. Close the maintenance event after external verification.

## Configuration changes

All changes use a pull request. The minimum validation is YAML parsing, formatting, and successful completion of the Upptime setup/site workflows. DNS changes for a custom domain are handled separately from status-page content.
