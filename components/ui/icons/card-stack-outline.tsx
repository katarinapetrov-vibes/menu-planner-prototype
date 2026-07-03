import { IconRoot, IconProps } from './icon'

export function CardStackOutline(props: IconProps) {
  return (
    <IconRoot {...props}>
      <path d="M6 2H18V4H6V2Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M2 10V22H22V10H2ZM20 12H4V20H20V12Z" fill="currentColor"/>
      <path d="M20 6H4V8H20V6Z" fill="currentColor"/>
    </IconRoot>
  )
}
