# Product Data Strategy: Monthly Report Dashboard

**Date**: 2026-02-02  
**Context**: Defining the mental model for handling data gaps identified in the Traceability Audit.

## 1. Product Philosophy
**"The Dashboard is a Command Center, not a Mirror."**
We are not trying to replicate the Excel spreadsheet cell-for-cell. The Excel is a data repository; the dashboard is a tool for **driving action** and **visualizing progress**. Features that clutter the view without adding accountability (like excessive metadata) are intentionally deprioritized. Features that obscure accountability (like missing raw submission counts) are critical gaps to fix.

---

## 2. Decision Framework

We categorize the "Unused" fields from the audit into four strategic buckets:

### A. Intentional Omissions (Noise Reduction)
*Fields that are technically available but actively harm the UX by adding clutter.*

| Field | Decision | Rationale |
|-------|----------|-----------|
| **Geography / Practice / Sector / Vertical** | **IGNORE** | These are analytics dimensions, not operational ones. A Project Manager checks "Project Alpha", not "North America - Healthcare - Alpha". We will omit these for MVP to keep the interface clean. |
| **Immediate Next Milestone** | **IGNORE** | In Excel, this is often unstructured text (e.g., "Waiting for client"). We capture this intent in the **Notes** field which is editable. We will not build a separate unstructured column for it. |
| **Dependencies on APQC** | **IGNORE** | Without a dependency graph UI, this is just more text. Better to handle in Notes. |
| **Sr. No.** | **IGNORE** | Sequential IDs are fragile. We rely on `Proposal Code` and internal UUIDs. |

### B. Strategic Data Preservation (Store Now, Show Later)
*Fields that aren't primary UI elements today but are critical for the data model's integrity and future logic.*

| Field | Decision | Action Required |
|-------|----------|-----------------|
| **Project Type** (Custom / SOW / Retainer) | **PRESERVE** | **CRITICAL**. A "Retainer" project behaves differently from a "One-off" SOW. Even if the UI card looks the same today, we *must* store this distinction in the `Project` model (`projectType`) to allow for distinct filtering and lifecycle logic later. |
| **Submission Metrics** (Target / Achieved) | **PRESERVE** | **CRITICAL**. Reducing `17/20` to `85%` destroys context. "85%" feels done; "3 submissions left" implies work. We must store `targetSubmissions` and `achievedSubmissions` in the model, even if we primarily show the progress bar. |

### C. Critical Integrity Fixes (Must Resolve for MVP)
*Gaps that break the trust in the system or create confusion.*

| Field | Gap | Fix Strategy |
|-------|-----|--------------|
| **Ownership Semantics** | Excel "APQC POC" ≠ Client. Excel "Ownership" = Client. | **REMAP**. This is a semantic failure. We must map Excel "APQC POC" explicitly to `Project.owner` (Internal Lead) and Excel "Ownership" to `Project.client` (Customer). Ambiguity here breaks the "My Projects" filter. |
| **Orphaned Deliverables** | Deliverables with no matching Project Code are silently dropped. | **LOG & WARN**. We cannot display deliverables without a parent. We will implement an "Import Warnings" log in the Admin console to alert the user: *"3 deliverables skipped due to missing Project Code reference."* |

### D. Acceptable Simplifications (MVP Tradeoffs)
*Areas where "Good Enough" is the right choice.*

| Field | Simplification | Rationale |
|-------|----------------|-----------|
| **Deliverable Status** | "QA / Review" mapped to "In Progress" | We don't have a QA workflow in the MVP dashboard. Grouping these under active work is an acceptable simplification. |
| **Pipeline Missing IDs** | Fallback to "Unknown" | Pipeline data is inherently messy. It is acceptable for `Proposal Code` or `Client` to be tentative or missing in the Pipeline view. |

---

## 3. Implementation Priorities

Based on this logic, here is the prioritized execution plan to close the gaps:

1.  **Modify Data Model (`data.ts`)**:
    *   Add `projectType` field.
    *   Add `targetSubmissions` & `achievedSubmissions` (number).
2.  **Update Parser (`initializeData.ts`)**:
    *   Extract "Custom/SOW" column into `projectType`.
    *   Extract raw submission counts.
    *   **Fix Semantic Mapping**: Hardcode `APQC POC` -> `owner`, `Ownership` -> `client`.
    *   **Add Integrity Check**: Capture orphaned deliverables into a warning list.
3.  **UI Updates**:
    *   Show "X / Y Submissions" tooltip on progress bars.
    *   Admin Page: Display "Import Warnings" if orphans exist.
