import { FlagRoot, FlagIconProps } from './flag-root'
export function FlagDK(p: FlagIconProps) {
  return (
    <FlagRoot {...p} aria-label={p['aria-label'] ?? 'Denmark'}>
      <rect width="20" height="15" fill="#C60C30"/>
      <rect x="6" width="2.5" height="15" fill="#FFFFFF"/>
      <rect y="6.25" width="20" height="2.5" fill="#FFFFFF"/>
    </FlagRoot>
  )
}
