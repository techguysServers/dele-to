import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  priority?: boolean
  href?: string
}

export function Logo({ className = "h-8 w-auto", priority = false, href }: LogoProps) {
  const images = (
    <>
      <Image
        src="/logo.svg"
        alt="Techguys"
        width={380}
        height={90}
        priority={priority}
        className={cn(className, "dark:hidden")}
      />
      <Image
        src="/logo-dark.svg"
        alt="Techguys"
        width={669}
        height={160}
        priority={priority}
        className={cn(className, "hidden dark:block")}
      />
    </>
  )

  if (href) {
    return (
      <Link href={href} className="shrink-0">
        {images}
      </Link>
    )
  }

  return images
}
