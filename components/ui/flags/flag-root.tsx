export interface FlagIconProps {
  /** Width in px — height matches width (square bounding box). Defaults to 20. */
  size?: number
  className?: string
  style?: React.CSSProperties
  'aria-label'?: string
}

export function FlagRoot({
  size = 20,
  className,
  style,
  'aria-label': ariaLabel,
  children,
}: FlagIconProps & { children?: React.ReactNode }) {
  const w = size
  const h = size
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 20 15"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', flexShrink: 0, ...style }}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      role={ariaLabel ? 'img' : undefined}
    >
      {children}
    </svg>
  )
}
