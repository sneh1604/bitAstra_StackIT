"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RichTextEditor } from "@/components/rich-text-editor"
import { TagSelector } from "@/components/tag-selector"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"

export default function AskQuestionPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  if (!user) {
    router.push("/auth/login")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !description.trim() || tags.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and select at least one tag.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          tags,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Question Posted!",
          description: "Your question has been successfully posted.",
        })
        router.push(`/questions/${data.data._id}`)
      } else {
        throw new Error(data.error || "Failed to post question")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post question",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Questions
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Ask a Question</h1>
          <p className="text-muted-foreground">Get help from the community by asking a detailed question</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question Details</CardTitle>
          <CardDescription>Be specific and imagine you're asking a question to another person</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="What's your programming question? Be specific."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground">{title.length}/200 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <div className="border rounded-lg overflow-hidden">
                <RichTextEditor
                  content={description}
                  onChange={setDescription}
                  placeholder="Provide all the details someone would need to understand and answer your question..."
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Include any error messages, code snippets, or relevant context
              </p>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <TagSelector selectedTags={tags} onTagsChange={setTags} maxTags={5} />
              <p className="text-sm text-muted-foreground">Add up to 5 tags to describe what your question is about</p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Post Question
              </Button>
              <Link href="/">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tips for a Great Question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium">Be specific</p>
              <p className="text-sm text-muted-foreground">
                Include details about what you've tried and what exactly isn't working
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium">Show your work</p>
              <p className="text-sm text-muted-foreground">
                Include code, error messages, or screenshots when relevant
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium">Use proper tags</p>
              <p className="text-sm text-muted-foreground">
                Choose tags that accurately describe your question's topic
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
