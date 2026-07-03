# Icon Requests

This starter kit ships with ~248 curated Sage icons. If you need an icon that isn't in `components/ui/icons/`, request it here.

## How to request

Add a row to the table below and raise it with the EUX team (Slack: #sage-ds-support or raise a GitHub issue on the EUX platform repo).

| Icon name needed | Where you need it | Priority | Requested by | Status |
|------------------|-------------------|----------|--------------|--------|
| (example) CheckCircleFilled | Status indicator in the header | High | Jane Smith | Pending |

## Finding the right name

Browse the full icon set at the EUX platform → Design System → Icons.
Icons follow the naming convention: `{descriptor}{Variant}` where variant is `Outline` or `Filled`.
Examples: `CheckOutline`, `DeleteOutline`, `HomeFilled`, `SearchOutline`.

## In the meantime

If you need an icon urgently, you can use `IconRoot` from `@/components/ui/icons` to wrap an inline SVG path with the correct Sage icon container size and style.

```tsx
import { IconRoot } from '@/components/ui/icons'

<IconRoot size="md">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path d="M..." />
  </svg>
</IconRoot>
```

Tag the usage with `// @temporary` so it's easy to find and replace when the Sage icon arrives.
