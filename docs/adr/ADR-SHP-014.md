# ADR-SHP-014 — Clone identity and reference policy

- **Status:** Approved
- **Owner:** B3B
- **Decision:** Armada/view clones share existing Team references; Fleet/Flotilla clones copy organization structure while preserving referenced TeamIds; an explicit Team clone creates new TeamId/VariantIds and no ATM binding until separately authorized. Move preserves identity; unlink deletes an unreferenced stopped definition only through the writer.
- **Alternatives rejected:** implicit runtime duplication, shared identity for copied teams, or discovery-driven resurrection.
- **Consequences:** cloned operational teams require explicit ATM binding and cannot inherit a running lease.
- **Evidence:** B5 golden fixtures for every clone/move/unlink case and running/revision conflicts.
