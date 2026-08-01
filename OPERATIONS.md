# Status Page Operations

## Components

| Component                    | Source                                                   | Public state |
| ---------------------------- | -------------------------------------------------------- | ------------ |
| Web                          | External HTTP check of `https://app.apemind.ai/`         | Automatic    |
| API Entry                    | External HTTP check of `https://app.apemind.ai/api/docs` | Automatic    |
| Chat                         | On-call verification and incident updates                | Manual       |
| Document Processing & Search | On-call verification and incident updates                | Manual       |

The public page must not include namespaces, Pod names, database names, customer identifiers, credentials, or raw logs.

## Automated incidents

Upptime checks Web and API Entry every five minutes. API Entry proves that the public API documentation route is reachable; it does not prove that all API business operations are healthy. A failed check opens or updates a GitHub issue and a successful check closes the automated incident. Before communicating customer impact, the on-call engineer confirms the result from a second network path and checks whether the affected user journey is actually unavailable.

## Manual incidents

Use this workflow for Chat and Document Processing & Search, or when an
automatic check is green but a confirmed user journey is impaired.

1. Confirm the affected public component and user-visible impact from an
   external path. Do not open an incident for an unconfirmed internal alert.
2. Open a public issue titled `[Incident] <component> - <impact>` and publish
   an **Investigating** update with the start time, impact, and next update
   time.
3. Add an **Identified** update when the cause or mitigation is understood.
   Include only customer-relevant facts, not internal topology or raw logs.
4. Add a **Monitoring** update after mitigation and external recovery checks.
5. Close the issue only after the affected journey is healthy from an external
   path. The closing comment is a **Resolved** update with the recovery time
   and final impact window.

Publish an update whenever impact or mitigation changes. If neither changes,
publish at the next-update time stated in the previous message. Never manually
close an automated Upptime incident while its external check is still failing.

### Public update template

```text
Status: Investigating | Identified | Monitoring | Resolved
Component: <public component name>
Impact: <what users can or cannot do>
Started: <UTC timestamp>
Update: <current customer-relevant fact>
Next update: <UTC timestamp or "Resolved">
```

## Incident lifecycle drill

Run this after changing the incident workflow and at least once per release
cycle. The drill must not change probe targets or production service state.

1. Open a public issue titled `[Drill] Status incident lifecycle - YYYY-MM-DD`.
   The first line must say `DRILL ONLY - no customer impact`.
2. Add one comment representing an **Identified** or **Monitoring** update.
3. Add a **Resolved** comment and close the issue.
4. Record the issue URL in the delivery receipt. Verify the issue history shows
   the open, update, and close events in order.

## Maintenance

Announce planned maintenance before the window. Include only the affected public component, expected impact, start time, and expected end time. Close the maintenance event after external verification.

## Configuration changes

All changes use a pull request. The minimum validation is YAML parsing, formatting, and successful completion of the Upptime setup/site workflows. DNS changes for a custom domain are handled separately from status-page content.

The Upptime version is intentionally pinned. Automated template updates are disabled because they require a long-lived token that can modify workflow files; upgrades use a reviewed pull request instead.
