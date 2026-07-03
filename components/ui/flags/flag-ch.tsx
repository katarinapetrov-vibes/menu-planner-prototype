import { FlagRoot, FlagIconProps } from './flag-root'
export function FlagCH(p: FlagIconProps) {
  return (
    <FlagRoot {...p} aria-label={p['aria-label'] ?? 'Switzerland'}>
      <rect width="20" height="15" fill="#FF0000"/>
      {/* White cross */}
      <rect x="8.5" y="3" width="3" height="9" fill="#FFFFFF"/>
      <rect x="5.5" y="6" width="9" height="3" fill="#FFFFFF"/>
    </FlagRoot>
  )
}
