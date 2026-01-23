# Demo Data

This folder powers demo mode when `VITE_DEMO_MODE=true`.

## Files
- Component mocks use matching file names (e.g., `chat.json` for Chat, `sessions.json` for Sessions).
- `chat.json`: welcome message + canned responses (fallback)
- `chat/1.json`, `chat/2.json`, ...: ordered chat responses for demo mode
- `sessions.json`: demo sessions list
- `events.json`: event list keyed by session id
- `traces.json`: trace tree keyed by session id
- `agents.json`: available agents
- `repo-tree.json`: file tree for the explorer
- `repo-files.json`: file contents keyed by path
- `artifacts.json`: artifacts keyed by session id
- `state.json`: state snapshots keyed by session id
- `eval.json`: evaluation cases
- `canvas.json`: canvas nodes/edges
- `builder-tabs.json`: builder tabs layout metadata
- `builder-assistant.json`: assistant welcome/suggestions
- `file-explorer.json`: explorer metadata
- `file-tabs.json`: open editor tabs
- `git-status-bar.json`: git status snapshot
- `monaco-editor.json`: editor defaults
- `side-panel.json`: side panel tab metadata
- `session-tab.json`: session tab labels
- `event-tab.json`: event tab filters
- `trace-tab.json`: trace tab metadata
- `artifact-tab.json`: artifact tab defaults
- `state-tab.json`: state tab defaults
- `eval-tab.json`: eval tab defaults
- `add-tool-dialog.json`: tool dialog suggestions
- `add-callback-dialog.json`: callback dialog stages
- `add-item-dialog.json`: add-item dialog suggestions
- `audio-player.json`: audio player tracks
- `chat-panel.json`: chat panel text defaults
- `confirmation-dialog.json`: confirmation dialog copy
- `edit-json-dialog.json`: edit JSON dialog sample
- `view-image-dialog.json`: view image dialog sample
- `markdown-renderer.json`: markdown renderer sample
- `json-editor.json`: JSON editor sample

Edit these JSON files to customize the demo experience.
