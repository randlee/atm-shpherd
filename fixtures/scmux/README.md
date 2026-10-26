# Sanitized scmux fixtures

These fixtures are behavior-oracle inputs for future importer/catalog/editor
tests. They are **not** live configuration and must never be launched.

## Provenance

- `team-definition.fixture.json` is a synthetic, schema-normalized derivative
  of the hierarchy and writer payload described in scmux commit
  `91928539961cd4638354a3cd635bc948daa099d6`:
  `docs/requirements.md`, `crates/scmux-daemon/src/definition_writer.rs`, and
  `dashboard/team-dashboard.jsx`.
- `tmuxp-session.fixture.json` is a sanitized derivative of
  `docs/example-session.json` at that same commit.

Names, IDs, prompt paths, host labels, project paths, branch labels, and
commands are placeholders. The fixtures deliberately contain no `.env`
content, credentials, mailbox/message bodies, absolute personal paths, live
database rows, or host addresses.

## Validation

The repository has no application build or fixture runner yet. Validate the
definition fixture with the installed JSON Schema CLI:

```sh
jsonschema fixtures/scmux/team-definition.schema.json \
  -i fixtures/scmux/team-definition.fixture.json
```

The command succeeds silently. `tmuxp-session.fixture.json` is intentionally
kept as a narrow source-format example; its safety/provenance constraints are
reviewed by this README rather than treated as an executable launch file.
