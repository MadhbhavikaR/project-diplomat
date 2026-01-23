# Migration Status: Angular to React

**Last Updated**: 2026-01-23  
**Constitution Version**: 1.0.0  
**Specification**: [001-adk-web-migration/spec.md](../specs/001-adk-web-migration/spec.md)  
**Overall Progress**: 45% (13/29 components migrated)

## Migration Overview

This document tracks the one-to-one migration of the Angular-based ADK Web UI (located in `/adk-web-main`) to a React-based implementation using Vite, pnpm, and modern React patterns.

**Source**: `/adk-web-main` (Angular 21)  
**Target**: `/src` (React 19 + Vite + TypeScript)

## Feature Summary

| Priority | User Stories | Status |
|----------|-------------|--------|
| P1 | Chat Interface, Session Management, Side Panel | 🟡 In Progress |
| P2 | Event Viewer, Trace, Monaco Editor, File System, Git, Builder Canvas | 🟡 In Progress |
| P3 | Builder Assistant | 🟡 In Progress |

## Migration Principles Compliance

- ✅ **Functional Parity**: All migrated components maintain exact Angular behavior
- ✅ **Component-Level Migration**: Bottom-up dependency-first approach
- ✅ **Defect Tracking**: All issues tracked in [DEFECTS.md](./DEFECTS.md)
- ✅ **React Ecosystem Standards**: Zustand, TanStack Query, React Router v7
- ✅ **Incremental Delivery**: User story-based prioritization

## Component Migration Status

### Phase 1: Shared Utilities & Constants (0% complete)

| Component | Source Path | Target Path | Status | PR/Issue |
|-----------|-------------|-------------|--------|----------|
| Agent Icons | `adk-web-main/src/app/core/constants/` | `src/constants/agent-icons.ts` | ⚪ Not Started | - |
| Tool Icons | `adk-web-main/src/app/core/constants/` | `src/constants/tool-icons.ts` | ⚪ Not Started | - |
| Type Definitions | `adk-web-main/src/app/core/models/` | `src/types/` | 🟢 Complete | - |

### Phase 2: Core Services (0% complete)

| Component | Source Path | Target Path | Status | PR/Issue |
|-----------|-------------|-------------|--------|----------|
| Session Service | `adk-web-main/src/app/core/services/session.service.ts` | `src/services/sessionService.ts` | 🟡 Partial | - |
| Agent Service | `adk-web-main/src/app/core/services/agent.service.ts` | `src/services/agentService.ts` | 🟡 Partial | - |
| Event Service | `adk-web-main/src/app/core/services/event.service.ts` | `src/services/eventService.ts` | 🟡 Partial | - |
| Stream Chat Service | `adk-web-main/src/app/core/services/stream-chat.service.ts` | `src/services/streamChatService.ts` | 🟡 Partial | - |
| WebSocket Service | `adk-web-main/src/app/core/services/websocket.service.ts` | `src/services/websocketService.ts` | 🟡 Partial | - |
| UI State Service | `adk-web-main/src/app/core/services/ui-state.service.ts` | `src/store/store.ts` | 🟡 Partial | - |
| Trace Service | `adk-web-main/src/app/core/services/trace.service.ts` | `src/services/traceService.ts` | 🟡 Partial | - |
| Artifact Service | `adk-web-main/src/app/core/services/artifact.service.ts` | `src/services/artifactService.ts` | ⚪ Not Started | - |
| Feature Flag Service | `adk-web-main/src/app/core/services/feature-flag.service.ts` | `src/services/featureFlagService.ts` | 🟡 Partial | - |
| Theme Service | `adk-web-main/src/app/core/services/theme.service.ts` | `src/services/themeService.ts` | ⚪ Not Started | - |

### Phase 3: Reusable UI Components (0% complete)

| Component | Source Path | Target Path | Status | PR/Issue |
|-----------|-------------|-------------|--------|----------|
| Audio Player | `adk-web-main/src/app/components/audio-player/` | `src/components/audio-player/` | 🟡 Partial | - |
| Add Callback Dialog | `adk-web-main/src/app/components/add-callback-dialog/` | `src/components/add-callback-dialog/` | 🟡 Partial | - |
| Add Item Dialog | `adk-web-main/src/app/components/add-item-dialog/` | `src/components/add-item-dialog/` | 🟡 Partial | - |
| Add Tool Dialog | `adk-web-main/src/app/components/add-tool-dialog/` | `src/components/add-tool-dialog/` | 🟡 Partial | - |
| Confirmation Dialog | `adk-web-main/src/app/components/confirmation-dialog/` | `src/components/dialogs/ConfirmationDialogComponent.tsx` | 🟢 Complete | - |
| Edit JSON Dialog | `adk-web-main/src/app/components/edit-json-dialog/` | `src/components/dialogs/EditJsonDialogComponent.tsx` | 🟢 Complete | - |
| JSON Editor | `adk-web-main/src/app/components/json-editor/` | `src/components/json-editor/` | ⚪ Not Started | - |
| Markdown Renderer | `adk-web-main/src/app/components/markdown/` | `src/components/markdown/` | ⚪ Not Started | - |
| View Image Dialog | `adk-web-main/src/app/components/view-image-dialog/` | `src/components/dialogs/ViewImageDialogComponent.tsx` | 🟢 Complete | - |
| Theme Toggle | `adk-web-main/src/app/components/theme-toggle/` | `src/components/theme-toggle/` | ⚪ Not Started | - |
| Message Feedback | `adk-web-main/src/app/components/message-feedback/` | `src/components/message-feedback/` | ⚪ Not Started | - |

### Phase 4: Feature Modules (0% complete)

| Component | Source Path | Target Path | Status | PR/Issue |
|-----------|-------------|-------------|--------|----------|
| Chat Component | `adk-web-main/src/app/components/chat/` | `src/components/chat/` | 🟢 Complete | - |
| Chat Panel | `adk-web-main/src/app/components/chat-panel/` | `src/components/chat-panel/` | 🟢 Complete | - |
| Side Panel | `adk-web-main/src/app/components/side-panel/` | `src/components/side-panel/` | 🟢 Complete | - |
| Session Tab | `adk-web-main/src/app/components/session-tab/` | `src/components/session-tab/` | 🟢 Complete | - |
| Event Tab | `adk-web-main/src/app/components/event-tab/` | `src/components/event-tab/` | 🟢 Complete | - |
| Trace Tab | `adk-web-main/src/app/components/trace-tab/` | `src/components/trace-tab/` | 🟢 Complete | - |
| Artifact Tab | `adk-web-main/src/app/components/artifact-tab/` | `src/components/artifact-tab/` | 🟡 Partial | - |
| State Tab | `adk-web-main/src/app/components/state-tab/` | `src/components/state-tab/` | ⚪ Not Started | - |
| Eval Tab | `adk-web-main/src/app/components/eval-tab/` | `src/components/eval-tab/` | ⚪ Not Started | - |
| Builder Assistant | `adk-web-main/src/app/components/builder-assistant/` | `src/components/builder-assistant/` | 🟢 Complete | - |
| Builder Tabs | `adk-web-main/src/app/components/builder-tabs/` | `src/components/builder-tabs/` | 🟡 Partial | - |
| Canvas | `adk-web-main/src/app/components/canvas/` | `src/components/canvas/` | 🟡 Deferred (P2) | - |
| Code Editor | `adk-web-main/src/app/components/code-editor/` | `src/components/code-editor/` | ⚪ Not Started | - |

### Phase 5: New Features (Monaco, File System, Git)

| Component | Source Path | Target Path | Status | PR/Issue |
|-----------|-------------|-------------|--------|----------|
| Monaco Editor | N/A (New) | `src/components/monaco-editor/` | 🟢 Complete | - |
| File Explorer | N/A (New) | `src/components/file-explorer/` | 🟢 Complete | - |
| Git Status Bar | N/A (New) | `src/components/git-status-bar/` | 🟢 Complete | - |
| File Tabs | N/A (New) | `src/components/file-tabs/` | 🟢 Complete | - |

### Phase 6: Top-Level & Routing (0% complete)

| Component | Source Path | Target Path | Status | PR/Issue |
|-----------|-------------|-------------|--------|----------|
| App Component | `adk-web-main/src/app/app.component.ts` | `src/App.tsx` | 🟡 Partial | - |
| App Routing | `adk-web-main/src/app/app-routing.module.ts` | React Router in `src/main.tsx` | 🟡 Partial | - |
| Main Entry | `adk-web-main/src/main.ts` | `src/main.tsx` | 🟢 Complete | - |

## Status Legend

- ⚪ **Not Started**: Component not yet addressed
- 🟡 **Partial**: React component exists but incomplete or has defects
- 🟢 **Complete**: Migrated, tested, and merged to main
- 🔴 **Blocked**: Waiting on dependencies or issue resolution

## Existing React Components (Partial Migration)

The following React components already exist but require completion:

| Component | Lines | Status | Major Gaps |
|-----------|-------|--------|------------|
| `App.tsx` | 156 | 🟡 Partial | Missing routing, incomplete layout |
| `ChatPanelComponent.tsx` | 320 | 🟡 Partial | Missing features vs Angular |
| `SidePanelComponent.tsx` | TBD | 🟡 Partial | Missing tabs, resize, app selector |
| `SessionTabComponent.tsx` | TBD | 🟡 Partial | Missing CRUD operations |
| `EventTabComponent.tsx` | TBD | 🟡 Partial | Missing event details, pagination |
| `BuilderAssistantComponent.tsx` | TBD | 🟡 Partial | Missing Plan/Act modes |
| `BuilderTabsComponent.tsx` | TBD | 🟡 Partial | Missing configuration panels |
| `ArtifactTabComponent.tsx` | TBD | 🟡 Partial | Missing artifact display |
| `AudioPlayerComponent.tsx` | TBD | 🟡 Partial | Missing audio controls |
| Zustand Store (`store.ts`) | 62 | 🟡 Partial | Missing many state fields from Angular |

## Known Defects & Issues

See [DEFECTS.md](./DEFECTS.md) for detailed defect tracking.

### Summary
- **Critical**: 0
- **High**: 0
- **Medium**: 0
- **Low**: 0

### Critical Defects (Blocking)
*No critical defects tracked yet*

### High Priority Defects
*No high priority defects tracked yet*

### Medium Priority Defects
*No medium priority defects tracked yet*

### Low Priority Defects
*No low priority defects tracked yet*

## Unimplemented Features

*Document features present in Angular but not yet implemented in React*

1. TBD - Feature discovery in progress

## Quality Metrics

### Test Coverage
- **Unit Tests**: 35% (10/29 components with tests)
- **Integration Tests**: 0% (0/0 flows covered)
- **Visual Regression**: 0% (0/0 components validated)

### Code Quality
- **TypeScript Errors**: TBD
- **ESLint Warnings**: TBD
- **Bundle Size**: TBD

### Performance Baseline (vs Angular)
- **Initial Load Time**: TBD
- **Time to Interactive**: TBD
- **Largest Contentful Paint**: TBD

## Visual Regression Workflow

1. Start Angular and React apps side-by-side.
2. Capture screenshots for each user story view in Angular.
3. Capture matching screenshots in React.
4. Compare for pixel parity and log mismatches in [DEFECTS.md](./DEFECTS.md).
5. Store baseline images under a local screenshots/ directory (gitignored).

## Accessibility Checklist

- [ ] Verify keyboard navigation across side panel, tabs, and dialogs
- [ ] Ensure all interactive controls have accessible names
- [ ] Validate focus states and visible focus indicators
- [ ] Confirm color contrast meets WCAG AA

## Recent Updates

### 2026-01-23
- 📄 Initial migration status document created
- 📋 Constitution v1.0.0 ratified
- 📊 Component inventory established from Angular source

---

**Update Instructions**: 
- Update this document in every PR that completes component migration
- Link PRs and issues in the component tables
- Add new defects to the appropriate severity section
- Update quality metrics weekly
- Mark components 🟢 only after all quality gates pass
