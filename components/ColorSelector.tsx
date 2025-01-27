
import React from "react"
import { Button } from "@/components/ui/button"

interface ColorSelectorProps {
  onColorChange: (color: string) => void
}

const colorOptions = [
  { name: "Indigo", value: "#4B0082" },
  { name: "Purple", value: "#800080" },
  { name: "Teal", value: "#008080" },
  { name: "Royal Blue", value: "#4169E1" },
  { name: "Forest Green", value: "#228B22" },
]

export default function ColorSelector({ onColorChange }: ColorSelectorProps) {
  return (
    <div className="fixed bottom-4 left-4 z-10 flex space-x-2">
      {colorOptions.map((color) => (
        <Button
          key={color.value}
          onClick={() => onColorChange(color.value)}
          style={{ backgroundColor: color.value }}
          className="w-8 h-8 rounded-full"
          aria-label={`Change particle color to ${color.name}`}
        />
      ))}
    </div>
  )
}
