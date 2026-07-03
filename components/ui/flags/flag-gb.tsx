import { FlagRoot, FlagIconProps } from './flag-root'
export function FlagGB(p: FlagIconProps) {
  return (
    <FlagRoot {...p} aria-label={p['aria-label'] ?? 'United Kingdom'}>
      <rect width="20" height="15" fill="#012169"/>
      {/* White diagonals */}
      <polygon points="0,0 0,1.875 7.5,7.5 0,13.125 0,15 2.5,15 10,9.375 17.5,15 20,15 20,13.125 12.5,7.5 20,1.875 20,0 17.5,0 10,5.625 2.5,0" fill="white"/>
      {/* Red diagonals */}
      <polygon points="0,0 0,1.25 8.333,7.5 0,13.75 0,15 1.667,15 10,8.75 18.333,15 20,15 20,13.75 11.667,7.5 20,1.25 20,0 18.333,0 10,6.25 1.667,0" fill="#C8102E"/>
      {/* White cross */}
      <rect x="7.5" width="5" height="15" fill="white"/>
      <rect y="5" width="20" height="5" fill="white"/>
      {/* Red cross */}
      <rect x="8.5" width="3" height="15" fill="#C8102E"/>
      <rect y="6" width="20" height="3" fill="#C8102E"/>
    </FlagRoot>
  )
}
