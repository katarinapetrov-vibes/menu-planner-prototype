import { IconRoot, IconProps } from './icon'

export function CardStackFilled(props: IconProps) {
  return (
    <IconRoot {...props}>
      <path d="M6 2H18V4H6V2Z" fill="currentColor"/>
      <path d="M4 6H20V8H4V6Z" fill="currentColor"/>
      <path d="M22 10H2V22H22V10Z" fill="currentColor"/>
    </IconRoot>
  )
}
