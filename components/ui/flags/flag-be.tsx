import { FlagRoot, FlagIconProps } from './flag-root'
export function FlagBE(p: FlagIconProps) {
  return (
    <FlagRoot {...p} aria-label={p['aria-label'] ?? 'Belgium'}>
      <rect width="6.667" height="15" fill="#000000"/>
      <rect x="6.667" width="6.667" height="15" fill="#FAE042"/>
      <rect x="13.333" width="6.667" height="15" fill="#ED2939"/>
    </FlagRoot>
  )
}
