import { FlagRoot, FlagIconProps } from './flag-root'
export function FlagES(p: FlagIconProps) {
  return (
    <FlagRoot {...p} aria-label={p['aria-label'] ?? 'Spain'}>
      <rect width="20" height="3.75" fill="#AA151B"/>
      <rect y="3.75" width="20" height="7.5" fill="#F1BF00"/>
      <rect y="11.25" width="20" height="3.75" fill="#AA151B"/>
    </FlagRoot>
  )
}
