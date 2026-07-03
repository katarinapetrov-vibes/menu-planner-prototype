import { FlagRoot, FlagIconProps } from './flag-root'
export function FlagNL(p: FlagIconProps) {
  return (
    <FlagRoot {...p} aria-label={p['aria-label'] ?? 'Netherlands'}>
      <rect width="20" height="5" fill="#AE1C28"/>
      <rect y="5" width="20" height="5" fill="#FFFFFF"/>
      <rect y="10" width="20" height="5" fill="#21468B"/>
    </FlagRoot>
  )
}
