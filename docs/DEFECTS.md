# Defects Registry: ADK Web Migration

**Last Updated**: 2026-01-24  
**Constitution Version**: 1.0.1  
**Related Specification**: [spec.md](../specs/001-adk-web-migration/spec.md)

## Defect Tracking Guidelines

Per Constitution Principle III (Defect Tracking & Quality Gates):
- Every discovered defect gets a tracked issue with severity
- Defects are classified as: Critical, High, Medium, Low
- Critical defects block PR approval
- High/Medium defects require tracking issue links before merge
- Low defects may be deferred with justification

## Defect Summary

| Severity | Open | Closed | Total |
|----------|------|--------|-------|
| Critical | 0    | 0      | 0     |
| High     | 0    | 0      | 0     |
| Medium   | 1    | 0      | 1     |
| Low      | 0    | 0      | 0     |
| **Total** | **1** | **0** | **1** |

---

## Critical Defects (Blocking)

*Critical defects prevent basic functionality or cause data loss. Must be fixed before any release.*

*No critical defects tracked yet.*

---

## High Priority Defects

*High priority defects affect major features but have workarounds. Should be fixed before release.*

*No high priority defects tracked yet.*

---

## Medium Priority Defects

*Medium priority defects affect secondary features or edge cases. May be deferred to patch release.*

### DEF-001: Agent selection does not load per-agent builder configuration

**Severity**: Medium  
**Status**: Open  
**Component**: Builder mode (side panel, canvas, config tabs)  
**Angular Reference**: `adk-web-main/src/app/components/builder-tabs/` + `adk-web-main/src/app/components/canvas/`  
**Discovered**: 2026-01-24  
**Assigned**: Unassigned

**Description**:
Selecting an agent (from the app selector, canvas, or breadcrumbs) and entering builder mode does not reset the canvas/config/tabs to that agent’s configuration. In the Angular reference, agent clicks call `setSelectedNode(...)` and the builder view updates per-agent state (including tools, callbacks, and nested sub-agents/agent tools). The React implementation keeps shared/global state, so agents with internal callbacks/tools or multiple sub-agents do not load their specific configuration when selected.

**Steps to Reproduce**:
1. Select an agent with tools/callbacks or sub-agents in the app selector
2. Click edit to enter builder mode
3. Click another agent node on the canvas (or breadcrumb)
4. Observe canvas and config tabs

**Expected Behavior**:
Builder mode loads the selected agent’s configuration; tabs and canvas reset to that agent’s data, including internal tools, callbacks, and sub-agent/agent-tool composition.

**Actual Behavior**:
Builder mode shows stale/global data and does not switch per agent.

**Root Cause** (if known):
Builder state is not keyed by selected agent; canvas and config use shared state and do not rehydrate per-agent tools/callbacks or nested agent contexts.

**Resolution**:
Pending

**Related PR/Issue**: TBD

---

## Low Priority Defects

*Low priority defects are cosmetic or minor inconveniences. Can be addressed in future iterations.*

*No low priority defects tracked yet.*

---

## Defect Template

When adding new defects, use this template:

```markdown
### DEF-[NUMBER]: [Brief Title]

**Severity**: Critical | High | Medium | Low  
**Status**: Open | In Progress | Closed  
**Component**: [React component or service name]  
**Angular Reference**: [Path to Angular source if migration regression]  
**Discovered**: [Date]  
**Assigned**: [Developer or "Unassigned"]

**Description**:
[Detailed description of the defect]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Root Cause** (if known):
[Technical explanation]

**Resolution**:
[Fix applied or "Pending"]

**Related PR/Issue**: [Link]
```

---

## Improvement Suggestions

*Track non-bug improvements discovered during migration. These are NOT defects but potential enhancements.*

### IMP-001: Consider React 19 Concurrent Features

**Type**: Performance Enhancement  
**Priority**: Low  
**Status**: Backlog

**Description**: React 19 introduces improved concurrent rendering. Consider leveraging `useTransition` and `useDeferredValue` for expensive operations like large message list rendering.

**Rationale**: Could improve perceived performance for sessions with 1000+ messages.

**Action**: Evaluate after P1 user stories complete.

---

### IMP-002: Monaco Editor Lazy Loading

**Type**: Performance Enhancement  
**Priority**: Medium  
**Status**: Backlog

**Description**: Monaco Editor is a large bundle (~2MB). Consider lazy loading the editor component to improve initial page load time.

**Rationale**: SC-002 requires interactive in under 3 seconds. Monaco adds significant bundle size.

**Action**: Implement code-splitting with React.lazy() for Monaco components.

---

### IMP-003: State Persistence with Zustand Persist

**Type**: UX Enhancement  
**Priority**: Low  
**Status**: Backlog

**Description**: Consider using Zustand's persist middleware to maintain UI state (panel sizes, active tab) across page refreshes.

**Rationale**: Improves developer experience by remembering preferences.

**Action**: Evaluate after P2 user stories complete.

---

## Defect Discovery Log

*Chronological log of when defects were discovered during migration.*

| Date | Defect ID | Severity | Component | Discoverer |
|------|-----------|----------|-----------|------------|
| *No entries yet* | | | | |

---

## Resolution Log

*Chronological log of defect resolutions.*

| Date | Defect ID | Resolution | PR Link |
|------|-----------|------------|---------|
| *No entries yet* | | | |

---

**Document Maintenance**:
- Update this document when new defects are discovered
- Move defects between sections as status changes
- Link to GitHub issues/PRs when available
- Review weekly during migration sync meetings
