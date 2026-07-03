# Flows

This folder contains `.flow.md` files — design plans for multi-view tools.

Each file is produced by `/sage-design-session` and consumed by `/sage-build`.

**Workflow:**
1. Run `/sage-design-session` → answers questions → confirms flow → saves `[tool-name].flow.md` here
2. Run `/sage-build` → reads the flow file → builds one view at a time

Do not edit flow files manually mid-build — they are the source of truth for what gets built.
