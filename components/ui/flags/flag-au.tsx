import { FlagRoot, FlagIconProps } from './flag-root'
export function FlagAU(p: FlagIconProps) {
  return (
    <FlagRoot {...p} aria-label={p['aria-label'] ?? 'Australia'}>
      <rect width="20" height="15" fill="#012169"/>
      {/* Union Jack */}
      <polygon points="0,0 0,1.875 7.5,7.5 0,13.125 0,15 2.5,15 10,9.375 17.5,15 20,15 20,13.125 12.5,7.5 20,1.875 20,0 17.5,0 10,5.625 2.5,0" fill="white"/>
      <polygon points="0,0 0,1.25 8.333,7.5 0,13.75 0,15 1.667,15 10,8.75 18.333,15 20,15 20,13.75 11.667,7.5 20,1.25 20,0 18.333,0 10,6.25 1.667,0" fill="#C8102E"/>
      {/* Stars placeholder — simplified */}
      <circle cx="4" cy="11" r="0.7" fill="white"/>
      <circle cx="7" cy="13.5" r="0.55" fill="white"/>
      <circle cx="7" cy="8.5" r="0.55" fill="white"/>
      <circle cx="10" cy="11" r="0.55" fill="white"/>
      <circle cx="5.5" cy="8" r="0.4" fill="white"/>
      <circle cx="16" cy="5" r="0.55" fill="white"/>
      <circle cx="15" cy="11" r="0.55" fill="white"/>
    </FlagRoot>
  )
}
