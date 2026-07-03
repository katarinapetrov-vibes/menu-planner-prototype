import { FlagRoot, FlagIconProps } from './flag-root'
export function FlagSE(p: FlagIconProps) {
  return (
    <FlagRoot {...p} aria-label={p['aria-label'] ?? 'Sweden'}>
      <rect width="20" height="15" fill="#006AA7"/>
      <rect x="5.5" width="2.5" height="15" fill="#FECC02"/>
      <rect y="6.25" width="20" height="2.5" fill="#FECC02"/>
    </FlagRoot>
  )
}
