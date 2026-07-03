import { FlagRoot, FlagIconProps } from './flag-root'
export function FlagCA(p: FlagIconProps) {
  return (
    <FlagRoot {...p} aria-label={p['aria-label'] ?? 'Canada'}>
      <rect width="5" height="15" fill="#FF0000"/>
      <rect x="5" width="10" height="15" fill="#FFFFFF"/>
      <rect x="15" width="5" height="15" fill="#FF0000"/>
      {/* Maple leaf — simplified */}
      <path d="M10 2.5 L10.6 4.8 L12.5 3.5 L11.8 5.5 L13.5 5.8 L11.5 7 L12 9 L10 8 L8 9 L8.5 7 L6.5 5.8 L8.2 5.5 L7.5 3.5 L9.4 4.8 Z" fill="#FF0000"/>
      <rect x="9.4" y="9" width="1.2" height="2" fill="#FF0000"/>
    </FlagRoot>
  )
}
