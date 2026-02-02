# Sample Report → Dashboard Traceability Audit

**Purpose**: Document the complete mapping of every column in Sample Report.xlsx.xlsx to the dashboard data model and UI.

**Date**: 2026-01-31  
**Scope**: All 6 sheets, every column analyzed

---

## Sheet 1: Cover Page

**Status**: ❌ **IGNORED** (by design)

**Reason**: Contains no structured data. Row 1 is empty, appears to be a title/logo page.

**Action**: None. This sheet is intentionally excluded from parsing.

---

## Sheet 2: Live Projects

**Row Count**: Multiple projects  
**Dashboard Category**: `Live`  
**Dashboard Page**: `/` (Index)  
**UI Components**: ProjectTable, KPIGrid, PortfolioCharts, KanbanBoard, ProjectTimeline, ProjectDetailDrawer

### Column Mapping

| Excel Column | Dashboard Field | Transformation | UI Location | Editable | Status |
|--------------|----------------|----------------|-------------|----------|--------|
| **Sr. No.** | ❌ Not mapped | N/A | N/A | N/A | ⚠️ **UNUSED** - Sequential ID, replaced by UUID |
| **Proposal Code** | `proposalCode` | `String()` | ProjectTable (sub-header), ProjectDetailDrawer (Details tab) | ❌ No (primary key) | ✅ **USED** |
| **Custom/SOW/RS/Internal/Advisory** | ❌ Not mapped | N/A | N/A | N/A | ⚠️ **UNUSED** - Project type metadata not in data model |
| **Project Name** | `name` | `String()` | ProjectTable (main row), ProjectDetailDrawer (Details tab, editable input) | ✅ Yes | ✅ **USED** |
| **APQC POC** | `owner` | `String()` mapped via keyword `['owner', 'lead', 'manager']` | ProjectTable (Owner column), ProjectDetailDrawer (Details tab, select/input), PortfolioCharts (Resource Load chart) | ✅ Yes | ✅ **USED** |
| **Start Date** | `startDate` | Excel serial → `DD/MM/YYYY` string via `parseExcelDate()` | ProjectDetailDrawer (Details tab, date picker), ProjectTimeline (start marker) | ✅ Yes | ✅ **USED** |
| **End Date** | `expectedDeliveryDate` | Excel serial → `DD/MM/YYYY` string via `parseExcelDate()` | ProjectDetailDrawer (Details tab, date picker), ProjectTimeline (end marker), KPIGrid (Projected Delivery calc) | ✅ Yes | ✅ **USED** |
| **Current Stage** | `status` | Mapped via `mapStatus()` function:<br>• "Completed" → `Completed`<br>• Default → `Not Started` | ProjectTable (Status badge), ProjectDetailDrawer (Details tab, select), KanbanBoard (column grouping), PortfolioCharts (Portfolio Health pie) | ✅ Yes (via select) | ✅ **USED** |
| **Immediate Next Milestone** | ❌ Not mapped | N/A | N/A | N/A | ⚠️ **UNUSED** - Milestone tracking not in data model |
| **Ownership** | `client` | `String()` mapped via keyword `['client', 'customer']` | ProjectTable (Client column), ProjectDetailDrawer (Details tab, editable input) | ✅ Yes | ✅ **USED** (interpreted as client org) |
| **Target # of Submissions** | ❌ Not mapped | N/A | N/A | N/A | ⚠️ **UNUSED** - Metric not in data model |
| **Achieved # of Submissions Till Date** | `progress` | Calculated as `(achieved/target)*100`, rounded to integer | ProjectTable (Progress bar %), ProjectDetailDrawer (Details tab, slider), KPIGrid (Global Velocity) | ✅ Yes (via slider) | ⚠️ **PARTIAL** - Inferred from achievement ratio, not directly mapped |
| **Remaining # of Submissions** | ❌ Not mapped | N/A | N/A | N/A | ⚠️ **UNUSED** - Derived field (target - achieved) |
| **Dependencies on APQC** | ❌ Not mapped | N/A | N/A | N/A | ⚠️ **UNUSED** - Dependency tracking not in data model |
| **Open Items** | `notes` | `String()` mapped via keyword `['notes', 'comments', 'remarks']` | ProjectDetailDrawer (Notes tab, textarea) | ✅ Yes | ✅ **USED** |
| **(Empty Column)** | N/A | N/A | N/A | N/A | ⚠️ **UNUSED** - Blank column in Excel |

### Columns NOT in Excel but in Dashboard

| Dashboard Field | Source | Default Value | Editable | Notes |
|-----------------|--------|---------------|----------|-------|
| `id` | Generated | `crypto.randomUUID()` | ❌ No | Internal identifier |
| `category` | Hardcoded | `'Live'` | ✅ Yes (via select) | Determines page visibility |
| `actualDeliveryDate` | User input | `null` | ✅ Yes | Not in Excel, UI-only field |
| `budget` | Hardcoded | `0` | ✅ Yes | Not parsed from Excel |
| `deliverables` | Linked from Sheet 5 | `[]` initially | ✅ Yes (via UI) | Populated from Deliverable Status sheet |
| `description` | User input | `undefined` | ✅ Yes | Not in Excel |
| `lastUpdated` | System | Current timestamp | ❌ No | Auto-managed |

---

## Sheet 3: Projects Yet to be Started

**Row Count**: Multiple projects  
**Dashboard Category**: `Pipeline`  
**Dashboard Page**: `/pipeline`  
**UI Components**: ProjectTable (reused), ProjectDetailDrawer

### Column Mapping

| Excel Column | Dashboard Field | Transformation | UI Location | Editable | Status |
|--------------|----------------|----------------|-------------|----------|--------|
| **Sr. No.** | ❌ Not mapped | N/A | N/A | N/A | ⚠️ **UNUSED** - Sequential ID |
| **Proposal Code** | `proposalCode` | `String()` | ProjectTable (sub-header), ProjectDetailDrawer | ❌ No | ✅ **USED** |
| **Custom/SOW/RS/Internal** | ❌ Not mapped | N/A | N/A | N/A | ⚠️ **UNUSED** - Project type |
| **Project Name** | `name` | `String()` | ProjectTable, ProjectDetailDrawer | ✅ Yes | ✅ **USED** |
| **APQC POC** | `owner` | `String()` | ProjectTable, ProjectDetailDrawer | ✅ Yes | ✅ **USED** |
| **Current Stage** | `status` | Mapped via `mapStatus()`, likely → `Not Started` | ProjectTable, ProjectDetailDrawer | ✅ Yes | ✅ **USED** |
| **Immediate Next Milestone** | ❌ Not mapped | N/A | N/A | N/A | ⚠️ **UNUSED** |
| **Target # of Submissions** | ❌ Not mapped | N/A | N/A | N/A | ⚠️ **UNUSED** - No progress field for pipeline |
| **Dependencies on APQC** | ❌ Not mapped | N/A | N/A | N/A | ⚠️ **UNUSED** |
| **Open Items** | `notes` | `String()` | ProjectDetailDrawer (Notes tab) | ✅ Yes | ✅ **USED** |
| **(Empty Columns)** | N/A | N/A | N/A | N/A | ⚠️ **UNUSED** - 3 blank columns |

### Missing in Excel

| Dashboard Field | Source | Default Value | Notes |
|-----------------|--------|---------------|-------|
| `startDate` | Not in Excel | `null` | Must be entered manually |
| `expectedDeliveryDate` | Not in Excel | `null` | Must be entered manually |
| `client` | Not in Excel | `'Unknown'` | Falls back to default |
| `progress` | Not in Excel | `0` | Defaults to 0% |
| `budget` | Not in Excel | `0` | Not captured |

---

## Sheet 4: Upcoming Projects

**Row Count**: Multiple projects  
**Dashboard Category**: `Pipeline`  
**Dashboard Page**: `/pipeline` (merged with "Yet to be Started")  
**UI Components**: ProjectTable, ProjectDetailDrawer

### Column Mapping

| Excel Column | Dashboard Field | Transformation | UI Location | Editable | Status |
|--------------|----------------|----------------|-------------|----------|--------|
| **Sr. No.** | ❌ Not mapped | N/A | N/A | N/A | ⚠️ **UNUSED** |
| **Proposal Code** | `proposalCode` | `String()` (handles "NA" as-is) | ProjectTable, ProjectDetailDrawer | ❌ No | ✅ **USED** |
| **APQC POC** | `owner` | `String()` | ProjectTable, ProjectDetailDrawer | ✅ Yes | ✅ **USED** |
| **Custom/SOW/RS/Internal** | ❌ Not mapped | N/A | N/A | N/A | ⚠️ **UNUSED** |
| **Project Name** | `name` | `String()` | ProjectTable, ProjectDetailDrawer | ✅ Yes | ✅ **USED** |
| **SOW Submission Date** | ❌ Not mapped | N/A | N/A | N/A | ⚠️ **UNUSED** - No "SOW date" field in model |
| **n=** | ❌ Not mapped | N/A | N/A | N/A | ⚠️ **UNUSED** - Sample size unclear |
| **Current Status/Last Comment** | `notes` | `String()` mapped via `['notes', 'comments']` | ProjectDetailDrawer (Notes tab) | ✅ Yes | ✅ **USED** |
| **(Empty Columns)** | N/A | N/A | N/A | N/A | ⚠️ **UNUSED** - 4 blank columns |

### Missing in Excel

Same as "Yet to be Started" - no dates, no client, no progress/budget.

---

## Sheet 5: Deliverable Status

**Row Count**: Multiple deliverables  
**Dashboard Storage**: Nested in `project.deliverables[]` array  
**Dashboard Page**: ProjectDetailDrawer (Deliverables tab)  
**UI Components**: Deliverable list within project detail

### Column Mapping

| Excel Column | Dashboard Field | Transformation | UI Location | Editable | Status |
|--------------|----------------|----------------|-------------|----------|--------|
| **Sr. No.** | ❌ Not mapped | N/A | N/A | N/A | ⚠️ **UNUSED** |
| **Custom/SOW/RS/Internal/Advisory** | ❌ Not mapped | N/A | N/A | N/A | ⚠️ **UNUSED** - Project type |
| **Project Name** | Used for linking (not stored) | Fuzzy match to project `proposalCode` | N/A (linking only) | N/A | ⚠️ **PARTIAL** - Used to find parent project, not stored in deliverable |
| **Phronesis PM** | ❌ Not mapped | N/A | N/A | N/A | ⚠️ **UNUSED** - PM not tracked per deliverable |
| **Deliverable Stage** | `name` | `String()` mapped via `['deliverable', 'name', 'item']` | ProjectDetailDrawer (Deliverables tab, list item) | ✅ Yes | ✅ **USED** (as deliverable name) |
| **Due Date** | `dueDate` | Excel serial → `DD/MM/YYYY` string | ProjectDetailDrawer (Deliverables tab, date next to item) | ✅ Yes | ✅ **USED** |
| **Delivered On** | ❌ Not mapped | N/A | N/A | N/A | ⚠️ **UNUSED** - Actual delivery date not in model |
| **EST Delivery Time** | ❌ Not mapped | N/A | N/A | N/A | ⚠️ **UNUSED** - Time estimate not tracked |
| **Status** (column 9) | `status` | Mapped via keyword matching:<br>• "progress" → `In Progress`<br>• "done/complete" → `Done`<br>• Default → `Pending` | ProjectDetailDrawer (Deliverables tab, status badge/toggle) | ✅ Yes | ✅ **USED** |
| **(Empty Column)** | N/A | N/A | N/A | N/A | ⚠️ **UNUSED** |
| **Status** (column 11) | ❌ Not mapped | N/A | N/A | N/A | ⚠️ **DUPLICATE** - Same as column 9, ignored |
| **%** | ❌ Not mapped | N/A | N/A | N/A | ⚠️ **UNUSED** - Deliverable % complete not in model |

### Linking Logic

- **Foreign Key**: Project Name column is fuzzy-matched to `project.proposalCode`
- **Orphan Handling**: If no matching project found, deliverable is **silently dropped** ⚠️
- **Relationship**: Deliverables are **nested** in `project.deliverables[]` array

### Missing in Dashboard

| Dashboard Field | Source | Default Value | Notes |
|-----------------|--------|---------------|-------|
| `id` | Generated | `crypto.randomUUID()` | Internal ID |

---

## Sheet 6: Closed Projects

**Row Count**: Multiple projects  
**Dashboard Category**: `Closed`  
**Dashboard Page**: `/archive`  
**UI Components**: ProjectTable, ProjectDetailDrawer

### Column Mapping

| Excel Column | Dashboard Field | Transformation | UI Location | Editable | Status |
|--------------|----------------|----------------|-------------|----------|--------|
| **Sr. No.** | ❌ Not mapped | N/A | N/A | N/A | ⚠️ **UNUSED** |
| **Proposal Code** | `proposalCode` | `String()` | ProjectTable, ProjectDetailDrawer | ❌ No | ✅ **USED** |
| **Custom/SOW** | ❌ Not mapped | N/A | N/A | N/A | ⚠️ **UNUSED** |
| **Project Name** | `name` | `String()` | ProjectTable, ProjectDetailDrawer | ✅ Yes | ✅ **USED** |
| **APQC POC** | `owner` | `String()` | ProjectTable, ProjectDetailDrawer | ✅ Yes | ✅ **USED** |
| **Start Date** | `startDate` | Excel serial → `DD/MM/YYYY` | ProjectDetailDrawer | ✅ Yes | ✅ **USED** |
| **End Date** | `expectedDeliveryDate` | Excel serial → `DD/MM/YYYY` | ProjectDetailDrawer | ✅ Yes | ✅ **USED** |
| **Current Stage** | `status` | Mapped via `mapStatus()`, likely → `Completed` | ProjectTable, ProjectDetailDrawer | ✅ Yes | ✅ **USED** |
| **Target # of Submissions** | ❌ Not mapped | N/A | N/A | N/A | ⚠️ **UNUSED** |
| **Achieved # of Submissions Till Date** | `progress` | Inferred as `(achieved/target)*100`, but target column missing in this sheet | ProjectTable, ProjectDetailDrawer | ✅ Yes | ⚠️ **PARTIAL** - Can be calculated if both columns present |

### Missing Columns in This Sheet

- **No Ownership column** → `client` will default to `'Unknown'`
- **No "Remaining" column** → Not needed
- **No "Achieved" without "Target"** → Progress defaults to `0`

---

## Summary of Unused Columns

### Across All Sheets

| Column Name | Sheet | Reason Not Used |
|-------------|-------|-----------------|
| Sr. No. | All sheets | Sequential ID; dashboard uses UUIDs |
| Custom/SOW/RS/Internal type | Live, Pipeline, Closed | Project classification not in data model |
| Immediate Next Milestone | Live, Pipeline sheets | Milestone tracking not implemented |
| Target/Achieved/Remaining Submissions | Live, Closed | Only used to infer `progress` %, not stored separately |
| Dependencies on APQC | Live, Pipeline | No dependency tracking feature |
| Empty columns | All sheets | Blank Excel columns |
| SOW Submission Date | Upcoming | No "SOW date" field in model |
| n= | Upcoming | Sample size field not in model |
| Phronesis PM | Deliverables | PM not tracked per deliverable |
| Delivered On | Deliverables | Actual delivery date not in model |
| EST Delivery Time | Deliverables | Time estimate not tracked |
| % (deliverable) | Deliverables | Deliverable completion % not in model |

---

## Data Loss Risk Areas

### 🔴 High Risk (Data Silently Dropped)

1. **Orphaned Deliverables**: If a deliverable's "Project Name" doesn't match any `proposalCode`, it is **not imported** and **not logged**.

2. **Progress Calculation**: "Achieved/Target" submissions are used to calculate `progress` but the raw numbers are **discarded**. Cannot reconstruct original metrics.

3. **Project Type Classification**: "Custom/SOW/RS/Internal" is lost. All projects categorized only by sheet (Live/Pipeline/Closed).

### ⚠️ Medium Risk (Workaround Possible)

4. **Milestones**: "Immediate Next Milestone" is stored in `notes` field if it matches keyword, but not as structured data.

5. **Dependencies**: "Dependencies on APQC" may be in `notes` but not queryable.

6. **Client vs Ownership**: The "Ownership" column is mapped to `client`, not `owner`. This may be a semantic mismatch.

### ℹ️ Low Risk (By Design)

7. **Empty Columns**: Intentionally ignored.

8. **Sequential IDs**: Replaced by UUIDs for uniqueness.

---

## Transformation Functions

### `parseExcelDate(val)`

**Input**: Excel serial number (e.g., `45678`) or Date object  
**Output**: `DD/MM/YYYY` string (e.g., `"05/06/2025"`)  
**Fallback**: If invalid, returns `null`

### `mapStatus(raw)`

**Input**: String from "Current Stage" column  
**Output**: One of: `'On Track' | 'Delayed' | 'Critical' | 'Completed' | 'Not Started'`

**Mapping**:
- Contains "track|live|ongoing|active" → `On Track`
- Contains "delay|late|behind" → `Delayed`
- Contains "critical|risk|blocked" → `Critical`
- Contains "complete|done|closed|finish" → `Completed`
- Default → `Not Started`

### `parseProgress(achieved, target)`

**Input**: Two numbers (achieved submissions, target submissions)  
**Output**: Integer 0-100  
**Formula**: `Math.round((achieved / target) * 100)`

---

## UI Surface Map

### Index Page (`/`)

**Data Source**: `category === 'Live'` projects

| Component | Fields Used |
|-----------|-------------|
| ProjectTable | `name`, `proposalCode`, `client`, `owner`, `status`, `progress` |
| KPIGrid | `category`, `status`, `progress`, `expectedDeliveryDate` |
| PortfolioCharts | `status` (pie), `owner` (bar chart) |
| KanbanBoard | `status` (grouping), `name`, `proposalCode`, `owner`, `progress` |
| ProjectTimeline | `startDate`, `expectedDeliveryDate`, `name`, `proposalCode`, `status` |

### Pipeline Page (`/pipeline`)

**Data Source**: `category === 'Pipeline'` projects

| Component | Fields Used |
|-----------|-------------|
| ProjectTable | Same as Index |
| KPI Cards | `budget` (total value), `length` (deal count) |

### Archive Page (`/archive`)

**Data Source**: `category === 'Closed'` projects

| Component | Fields Used |
|-----------|-------------|
| ProjectTable | Same as Index |

### ProjectDetailDrawer (All Pages)

**Opens for**: Any clicked project

| Tab | Fields Displayed | Editable |
|-----|-----------------|----------|
| Details | All project fields (`name`, `proposalCode`, `client`, `owner`, `status`, `progress`, `budget`, `category`, `startDate`, `expectedDeliveryDate`, `actualDeliveryDate`) | ✅ Yes (except `proposalCode`, `id`) |
| Notes | `notes`, `description` | ✅ Yes |
| Deliverables | `deliverables[]` array (nested `name`, `status`, `dueDate`) | ✅ Yes (add/remove/toggle status) |
| History | Audit logs (not from Excel) | ❌ Read-only |

---

## Verification Checklist

- [x] Sheet 1 (Cover Page) intentionally ignored
- [x] Sheet 2 (Live Projects) → 16 columns analyzed
- [x] Sheet 3 (Yet to Start) → 10 columns analyzed
- [x] Sheet 4 (Upcoming) → 8 columns analyzed
- [x] Sheet 5 (Deliverables) → 12 columns analyzed
- [x] Sheet 6 (Closed) → 10 columns analyzed
- [x] All used columns traced to UI
- [x] All unused columns documented
- [x] All transformations explained
- [x] Data loss risks identified
- [x] UI surface map complete

---

## Recommendations

### Immediate Fixes Needed

1. **Log Orphaned Deliverables**: Show warning if a deliverable can't be matched to a project.

2. **Fix "Ownership" Semantic Mismatch**: "Ownership" column (APQC POC belongs to APQC, not the client) is being mapped to `client`. Should likely be `owner` (project lead).

3. **Preserve Submission Metrics**: Store `targetSubmissions`, `achievedSubmissions` separately instead of collapsing to `progress` %.

### Future Enhancements

4. **Project Type Field**: Add `projectType: 'Custom' | 'SOW' | 'RS' | 'Internal' | 'Advisory'` to preserve classification.

5. **Milestone Tracking**: Add structured `milestones[]` array instead of storing in `notes`.

6. **Deliverable Details**: Add `actualDeliveryDate`, `estimatedTime`, `completionPercent` fields.

7. **SOW-Specific Fields**: For Upcoming projects, capture `sowSubmissionDate` and `sampleSize`.
