# Phase B issue inventory

The authoritative implementation inventory is the set returned by
`bd children shp-phase-b`: exactly 25 open direct children, each named by one
`docs/plans/phase-b/sprint-b-*.md` frontmatter `bead` field. Plan validation
requires a bijection between those 25 IDs and the 25 sprint documents.

The identifiers `shp-phase-b.5` and `shp-phase-b.15` are retained current
children whose titles/scope were re-cut to B4A and B3A. Their earlier B4 and B3A
titles are history entries, not extra implementation sprints. No obsolete
parent-child edges remain. Plan-anchor root/question/report beads may carry the
`phase:b` label, but are governance records outside the Phase B epic and are
not counted as implementation sprints.

The deterministic inventory check is:

1. list direct children of `shp-phase-b` and sort by bead ID;
2. parse every Phase B sprint document's `bead` value and sort by bead ID;
3. require both sets to contain 25 unique, identical IDs;
4. require every implementation child to remain open until its sprint's own
   acceptance evidence passes; and
5. report anchor/governance records separately rather than treating a shared
   label as a parent edge.

Any future split or retirement must update the parent edge, sprint registry,
wave metrics, and this classification in one planning commit.
