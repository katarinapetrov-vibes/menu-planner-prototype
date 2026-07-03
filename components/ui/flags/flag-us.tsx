import { FlagRoot, FlagIconProps } from './flag-root'
export function FlagUS(p: FlagIconProps) {
  return (
    <FlagRoot {...p} aria-label={p['aria-label'] ?? 'United States'}>
      {/* 13 stripes */}
      {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
        <rect key={i} y={i * (15/13)} width="20" height={15/13} fill={i % 2 === 0 ? '#B22234' : '#FFFFFF'}/>
      ))}
      {/* Canton */}
      <rect width="8" height={15 * 7/13} fill="#3C3B6E"/>
      {/* 50 stars — simplified grid of dots */}
      {[0,1,2,3,4].map(row =>
        [0,1,2,3,4,5].map(col => (
          <circle key={`${row}-${col}`} cx={0.65 + col * 1.2} cy={0.5 + row * 1.0} r="0.22" fill="white"/>
        ))
      )}
      {[0,1,2,3].map(row =>
        [0,1,2,3,4].map(col => (
          <circle key={`b${row}-${col}`} cx={1.25 + col * 1.2} cy={1.0 + row * 1.0} r="0.22" fill="white"/>
        ))
      )}
    </FlagRoot>
  )
}
