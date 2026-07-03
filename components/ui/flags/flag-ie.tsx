import { FlagRoot, FlagIconProps } from './flag-root'
export function FlagIE(p: FlagIconProps) {
  return (
    <FlagRoot {...p} aria-label={p['aria-label'] ?? 'Ireland'}>
      <rect width="6.667" height="15" fill="#169B62"/>
      <rect x="6.667" width="6.667" height="15" fill="#FFFFFF"/>
      <rect x="13.333" width="6.667" height="15" fill="#FF883E"/>
    </FlagRoot>
  )
}
