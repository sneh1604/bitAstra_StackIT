"use client"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, X, Plus } from "lucide-react"

interface Tag {
  _id: string
  name: string
  questionsCount: number
}

interface TagFilterProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
}

export function TagFilter({ selectedTags, onTagsChange }: TagFilterProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const fetchTags = useCallback(async () => {
    try {
      const response = await fetch("/api/tags?popular=true")
      const data = await response.json()
      if (data.success) {
        setTags(data.data)
      }
    } catch (error) {
      console.error("Error fetching tags:", error)
    }
  }, [])

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  const filteredTags = tags.filter(
    (tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()) && !selectedTags.includes(tag._id),
  )

  const handleTagSelect = useCallback((tagId: string) => {
    onTagsChange([...selectedTags, tagId])
    setSearchQuery("")
  }, [selectedTags, onTagsChange])

  const handleTagRemove = useCallback((tagId: string) => {
    onTagsChange(selectedTags.filter((id) => id !== tagId))
  }, [selectedTags, onTagsChange])

  const handleClearAll = useCallback(() => {
    onTagsChange([])
  }, [onTagsChange])

  const getTagName = useCallback((tagId: string) => {
    const tag = tags.find((t) => t._id === tagId)
    return tag?.name || tagId
  }, [tags])

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filter by tags:</span>
      </div>

      {/* Selected Tags */}
      <AnimatePresence>
        {selectedTags.map((tagId) => (
          <motion.div
            key={tagId}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Badge variant="default" className="gap-1">
              {getTagName(tagId)}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTagRemove(tagId)}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add Tag Button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Plus className="h-4 w-4" />
            Add Tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Select Tags</h4>
              <Input
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2">
              {filteredTags.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {searchQuery ? "No tags found" : "All popular tags are selected"}
                </p>
              ) : (
                filteredTags.map((tag) => (
                  <motion.div key={tag._id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="ghost"
                      className="w-full justify-between h-auto p-3"
                      onClick={() => handleTagSelect(tag._id)}
                    >
                      <div className="text-left">
                        <div className="font-medium">{tag.name}</div>
                        <div className="text-xs text-muted-foreground">{tag.questionsCount} questions</div>
                      </div>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {selectedTags.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="text-muted-foreground hover:text-foreground"
        >
          Clear all
        </Button>
      )}
    </div>
  )
}
