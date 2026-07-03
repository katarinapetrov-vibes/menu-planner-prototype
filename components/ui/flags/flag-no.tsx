import { FlagRoot, FlagIconProps } from './flag-root'
export function FlagNO(p: FlagIconProps) {
  return (
    <FlagRoot {...p} aria-label={p['aria-label'] ?? 'Norway'}>
      <rect width="20" height="15" fill="#EF2B2D"/>
      <rect x="5.5" width="2.5" height="15" fill="#FFFFFF"/>
      <rect y="6.25" width="20" height="2.5" fill="#FFFFFF"/>
      <rect x="6" width="1.5" height="15" fill="#002868"/>
      <rect y="6.75" width="20" height="1.5" fill="#002868"/>
    </FlagRoot>
  )
}
