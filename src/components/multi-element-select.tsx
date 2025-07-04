// src/components/multi-element-select.tsx
"use client"
import { useMemo, useState } from "react"
import {
  Popover, PopoverTrigger, PopoverContent,
} from "./ui/popover"
import { Button } from "./ui/button"
import { Command, CommandInput, CommandItem, CommandList } from "./ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "../lib/utils"

interface Props {
  allElements: string[]
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  maxHeight?: number
}

export function MultiElementSelect({
  allElements,
  value,
  onChange,
  placeholder = "Seleccionar elementos…",
  maxHeight = 260,
}: Props) {
  const [open,   setOpen]   = useState(false)
  const [search, setSearch] = useState("")

  const groups = useMemo(() => {
    const g: Record<string, string[]> = {}
    allElements
      .filter((el) => el.toLowerCase().includes(search.toLowerCase()))
      .forEach((el) => {
        const k = el[0].toUpperCase()
        g[k] ??= []
        g[k].push(el)
      })
    return g
  }, [allElements, search])

  const toggle = (el: string) =>
    onChange(value.includes(el) ? value.filter((x) => x !== el) : [...value, el])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between">
          {value.length
            ? `${value.length} seleccionado${value.length > 1 ? "s" : ""}`
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-64">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar…"
            value={search}
            onValueChange={(v) => setSearch(v)}
            className="h-9"
          />
          <div
            className="overflow-y-auto"
            style={{ maxHeight }}
          >
            {Object.entries(groups).map(([letter, els]) => (
              <CommandList key={letter}>
                <p className="px-3 py-1 text-xs font-semibold text-muted-foreground">{letter}</p>
                {els.map((el) => (
                  <CommandItem key={el} onSelect={() => toggle(el)} className="cursor-pointer">
                    <Check
                      className={cn("mr-2 h-4 w-4", value.includes(el) ? "opacity-100" : "opacity-0")}
                    />
                    {el}
                  </CommandItem>
                ))}
              </CommandList>
            ))}
            {search && !Object.keys(groups).length && (
              <p className="py-6 text-center text-sm text-muted-foreground">Sin resultados</p>
            )}
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
