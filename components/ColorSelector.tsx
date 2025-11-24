
import React from "react"
import { Button } from "@/components/ui/button"

interface ColorSelectorProps {
  selectedColor: string
  onColorChange: (color: string) => void
}

const colorOptions = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
  { name: "Green", value: "#10b981" },
  { name: "Orange", value: "#f97316" },
  { name: "Red", value: "#ef4444" },
  { name: "Yellow", value: "#eab308" },
  { name: "Teal", value: "#14b8a6" },
]

export default function ColorSelector({ selectedColor, onColorChange }: ColorSelectorProps) {
  return (
    <div className="flex gap-2 items-center">
      <span className="text-white/60 text-sm whitespace-nowrap">Color:</span>
      <div className="flex gap-1">
        {colorOptions.map((color) => (
          <button
            key={color.value}
            onClick={() => onColorChange(color.value)}
            style={{ backgroundColor: color.value }}
            className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${
              selectedColor === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''
            }`}
            aria-label={`Select ${color.name} color`}
            type="button"
          />
        ))}
      </div>
    </div>
  )
}
