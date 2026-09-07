"use client"

import { Lightbulb } from "lucide-react"

interface InlineTipProps {
  children: React.ReactNode
  className?: string
}

export function InlineTip({ children, className = "" }: InlineTipProps) {
  return (
    <div 
      className={`flex items-start gap-2 p-3 rounded-lg text-sm border border-border bg-muted/50 ${className}`}
    >
      <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
      <div className="text-foreground">{children}</div>
    </div>
  )
}
