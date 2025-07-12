"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RichTextEditor } from "@/components/rich-text-editor"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Send, MessageSquare } from "lucide-react"

interface AnswerFormProps {
  questionId: string
  onAnswerAdded: () => void
}

export function AnswerForm({ questionId, onAnswerAdded }: AnswerFormProps) {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      toast({
        title: "Missing Content",
        description: "Please provide an answer before submitting.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/answers/${questionId}/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          content: content.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Answer Posted!",
          description: "Your answer has been successfully posted.",
        })
        setContent("")
        onAnswerAdded()
      } else {
        throw new Error(data.error || "Failed to post answer")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post answer",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">Want to answer this question?</h3>
            <p className="text-muted-foreground">Sign in to share your knowledge with the community</p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button asChild>
              <a href="/auth/login">Sign In</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/auth/register">Sign Up</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Your Answer
          </CardTitle>
          <CardDescription>Share your knowledge and help the community by providing a detailed answer</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border rounded-lg overflow-hidden">
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Write your answer here... Be specific and provide examples when possible."
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading || !content.trim()} className="gap-2">
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Post Answer
              </Button>
              <Button type="button" variant="outline" onClick={() => setContent("")} disabled={loading}>
                Clear
              </Button>
            </div>
          </form>

          {/* Tips */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Tips for a great answer:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Be specific and provide step-by-step explanations</li>
              <li>• Include code examples or relevant links when helpful</li>
              <li>• Explain not just what to do, but why it works</li>
              <li>• Keep your answer focused on the question asked</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
