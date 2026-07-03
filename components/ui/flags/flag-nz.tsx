import { FlagRoot, FlagIconProps } from './flag-root'
export function FlagNZ(p: FlagIconProps) {
  return (
    <FlagRoot {...p} aria-label={p['aria-label'] ?? 'New Zealand'}>
      <rect width="20" height="15" fill="#012169"/>
      {/* Union Jack */}
      <polygon points="0,0 0,1.875 7.5,7.5 0,13.125 0,15 2.5,15 10,9.375 17.5,15 20,15 20,13.125 12.5,7.5 20,1.875 20,0 17.5,0 10,5.625 2.5,0" fill="white"/>
      <polygon points="0,0 0,1.25 8.333,7.5 0,13.75 0,15 1.667,15 10,8.75 18.333,15 20,15 20,13.75 11.667,7.5 20,1.25 20,0 18.333,0 10,6.25 1.667,0" fill="#C8102E"/>
      {/* Southern Cross — 4 red stars */}
      <polygon points="14.5,3 14.8,4 15.8,4 15,4.6 15.3,5.6 14.5,5 13.7,5.6 14,4.6 13.2,4 14.2,4" fill="#CC142B"/>
      <polygon points="16.5,7 16.7,7.7 17.4,7.7 16.9,8.1 17.1,8.8 16.5,8.4 15.9,8.8 16.1,8.1 15.6,7.7 16.3,7.7" fill="#CC142B"/>
      <polygon points="13,8 13.2,8.7 13.9,8.7 13.4,9.1 13.6,9.8 13,9.4 12.4,9.8 12.6,9.1 12.1,8.7 12.8,8.7" fill="#CC142B"/>
      <polygon points="15,10.5 15.2,11.2 15.9,11.2 15.4,11.6 15.6,12.3 15,11.9 14.4,12.3 14.6,11.6 14.1,11.2 14.8,11.2" fill="#CC142B"/>
    </FlagRoot>
  )
}
