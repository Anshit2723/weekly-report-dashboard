# Project Discussion Logs & Context

## Summary of Recent Decisions (2026-02-02)

### 1. The "Excel Clone" Trap
We explicitly decided **NOT** to build an Excel clone. The dashboard is a "Command Center".
*   **Decision**: Unused Excel columns like "Geography", "Sector", and unstructured "Next Milestone" text are being **intentionally ignored** to preserve UI simplicity.
*   **Decision**: We are prioritizing **Data Integrity** (storing "Project Type" and "Submission Counts" in the backend model) even if they aren't fully visualized in the UI cards yet.

### 2. Critical Bugs Identified
Two major data issues were found during the audit:
*   **Ownership Semantics**: The dashboard was mapping "APQC POC" to "Owner" (correct) but Excel "Ownership" to "Client" (ambiguous). We need to hardcode this mapping to ensure "My Projects" filters work for the internal lead.
*   **Orphaned Deliverables**: Deliverables in Sheet 5 that don't match a Project Code in Sheet 2 are currently invalid and dropped silently. We need to add an **Admin Log** to warn the user about these drops.

### 3. Immediate Next Steps (For the Office Agent)
The current active task is: **"Implementing the Data Strategy"**.

**Your Checklist:**
1.  Open `src/types/data.ts`.
2.  Add `projectType: 'SOW' | 'Retainer' | 'Custom'` to the Project interface.
3.  Add `targetSubmissions` and `achievedSubmissions` (number) to the Project interface.
4.  Open `src/services/initializeData.ts`.
5.  Update the parser to populate these new fields from the Excel columns identified in `data_mapping_audit.md`.
6.  Fix the mapping logic for `owner` and `client`.

### 4. Why is `node_modules` not here?
It was excluded to make the git push/pull fast ("heavy project"). Run `npm install` to hydrate it.

### 5. Why is `dist` not here?
It is a build artifact. Run `npm run build` to generate it.
