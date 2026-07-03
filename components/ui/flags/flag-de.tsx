import { FlagRoot, FlagIconProps } from './flag-root'
export function FlagDE(p: FlagIconProps) {
  return (
    <FlagRoot {...p} aria-label={p['aria-label'] ?? 'Germany'}>
      <rect width="20" height="5" fill="#000000"/>
      <rect y="5" width="20" height="5" fill="#DD0000"/>
      <rect y="10" width="20" height="5" fill="#FFCE00"/>
    </FlagRoot>
  )
}
