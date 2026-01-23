# Defects Registry: ADK Web Migration

**Last Updated**: 2026-01-23  
**Constitution Version**: 1.0.0  
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
| Medium   | 0    | 0      | 0     |
| Low      | 0    | 0      | 0     |
| **Total** | **0** | **0** | **0** |

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

*No medium priority defects tracked yet.*

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
