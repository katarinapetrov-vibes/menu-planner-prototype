import { FlagRoot, FlagIconProps } from './flag-root'
export function FlagFR(p: FlagIconProps) {
  return (
    <FlagRoot {...p} aria-label={p['aria-label'] ?? 'France'}>
      <rect width="6.667" height="15" fill="#002395"/>
      <rect x="6.667" width="6.667" height="15" fill="#FFFFFF"/>
      <rect x="13.333" width="6.667" height="15" fill="#ED2939"/>
    </FlagRoot>
  )
}
