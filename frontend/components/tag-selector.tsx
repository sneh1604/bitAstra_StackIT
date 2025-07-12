"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Check } from "lucide-react"

interface Tag {
  _id: string
  name: string
  questionsCount: number
}

interface TagSelectorProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  maxTags?: number
}

export function TagSelector({ selectedTags, onTagsChange, maxTags = 5 }: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags")
      const data = await response.json()
      if (data.success) {
        setTags(data.data)
      }
    } catch (error) {
      console.error("Error fetching tags:", error)
    }
  }

  const handleTagSelect = (tagName: string) => {
    if (selectedTags.length >= maxTags) return
    if (!selectedTags.includes(tagName)) {
      onTagsChange([...selectedTags, tagName])
    }
    setSearchValue("")
    setOpen(false)
  }

  const handleTagRemove = (tagName: string) => {
    onTagsChange(selectedTags.filter((tag) => tag !== tagName))
  }

  const availableTags = tags.filter(
    (tag) => !selectedTags.includes(tag.name) && tag.name.toLowerCase().includes(searchValue.toLowerCase()),
  )

  return (
    <div className="space-y-3">
      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {selectedTags.map((tagName) => (
            <motion.div
              key={tagName}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Badge variant="default" className="gap-1 pr-1">
                {tagName}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTagRemove(tagName)}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Tag Button */}
        {selectedTags.length < maxTags && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Plus className="h-4 w-4" />
                Add Tag
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <Command>
                <CommandInput placeholder="Search tags..." value={searchValue} onValueChange={setSearchValue} />
                <CommandList>
                  <CommandEmpty>
                    {searchValue && (
                      <div className="p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-2">No existing tag found for "{searchValue}"</p>
                        <Button size="sm" onClick={() => handleTagSelect(searchValue)} className="gap-2">
                          <Plus className="h-4 w-4" />
                          Create "{searchValue}"
                        </Button>
                      </div>
                    )}
                  </CommandEmpty>
                  <CommandGroup className="max-h-48 overflow-y-auto">
                    {availableTags.map((tag) => (
                      <CommandItem
                        key={tag._id}
                        value={tag.name}
                        onSelect={() => handleTagSelect(tag.name)}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <div className="font-medium">{tag.name}</div>
                          <div className="text-xs text-muted-foreground">{tag.questionsCount} questions</div>
                        </div>
                        <Check className="h-4 w-4" />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Tag Limit Info */}
      <p className="text-sm text-muted-foreground">
        {selectedTags.length}/{maxTags} tags selected
        {selectedTags.length >= maxTags && " (maximum reached)"}
      </p>
    </div>
  )
}
