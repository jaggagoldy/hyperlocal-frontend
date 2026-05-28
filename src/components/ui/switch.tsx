"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'checked' | 'onChange'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(checked || false)

    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked)
      }
    }, [checked])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked
      setIsChecked(newChecked)
      if (onCheckedChange) {
        onCheckedChange(newChecked)
      }
    }

    return (
      <label className="relative inline-flex items-center cursor-pointer select-none">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={isChecked}
          onChange={handleChange}
          ref={ref}
          {...props}
        />
        <div className={cn(
          "w-9 h-5 bg-zinc-200 rounded-full peer peer-focus:outline-none transition-colors duration-200 ease-in-out dark:bg-zinc-800",
          "peer-checked:bg-emerald-600",
          "after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all after:duration-200 after:ease-in-out",
          "peer-checked:after:translate-x-4",
          className
        )} />
      </label>
    )
  }
)

Switch.displayName = "Switch"

export { Switch }
