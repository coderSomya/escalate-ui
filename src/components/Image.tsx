import type { ImgHTMLAttributes } from 'react'

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  alt: string
}

export const Image = ({ alt, ...rest }: Props) => {
  return <img alt={alt} {...rest} />
}

