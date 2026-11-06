# Phase B issue inventory

The authoritative implementation inventory is the unique set of bead IDs named
by `docs/plans/phase-b/sprint-b-*.md` frontmatter. Each ID must resolve under the
Phase B epic and remain an implementation record. Direct epic children that are
explicitly typed as governance, evaluation, or history records are reported but
are not required to have a sprint document.

The identifiers `shp-phase-b.5` and `shp-phase-b.15` are retained current
children whose titles/scope were re-cut to B4A and B3A. Their earlier B4 and B3A
titles are history entries, not extra implementation sprints. No obsolete
parent-child edges remain. Plan-anchor root/question/report beads and
`shp-phase-b.26` are governance records, not implementation sprints, even when
attached to the Phase B epic.

The deterministic inventory check is:

1. parse every Phase B sprint document's `bead` value and require uniqueness;
2. resolve each referenced record under `shp-phase-b` and require it to be classified as implementation;
3. list remaining direct children separately as governance/history or report an unclassified record;
4. require every implementation record to remain open until its sprint's own
   acceptance evidence passes; and
5. report anchor/governance records separately rather than treating a shared
   label as a parent edge.

Any future split or retirement must update the parent edge, sprint registry,
wave metrics, and this classification in one planning commit.
