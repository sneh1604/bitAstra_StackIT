"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { QuestionDetail } from "@/components/question-detail"
import { AnswerList } from "@/components/answer-list"
import { AnswerForm } from "@/components/answer-form"
import { useAuth } from "@/contexts/auth-context"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Question {
  _id: string
  title: string
  description: string
  author: {
    _id: string
    username: string
    avatar: string
    reputation: number
  }
  tags: Array<{
    _id: string
    name: string
  }>
  votes: number
  views: number
  answers: string[]
  acceptedAnswer?: string
  createdAt: string
  updatedAt: string
}

export default function QuestionPage() {
  const params = useParams()
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (params.id) {
      fetchQuestion()
    }
  }, [params.id])

  const fetchQuestion = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/questions/${params.id}`)
      const data = await response.json()

      if (data.success) {
        setQuestion(data.data)
      }
    } catch (error) {
      console.error("Error fetching question:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerAdded = () => {
    fetchQuestion() // Refresh question data
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-3/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="flex gap-2">
            <div className="h-6 bg-muted rounded w-16"></div>
            <div className="h-6 bg-muted rounded w-20"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="text-6xl">❓</div>
        <h3 className="text-xl font-semibold">Question not found</h3>
        <p className="text-muted-foreground">The question you're looking for doesn't exist or has been removed.</p>
        <Link href="/">
          <Button>Back to Questions</Button>
        </Link>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Questions
          </Button>
        </Link>
      </div>

      <QuestionDetail question={question} onUpdate={fetchQuestion} />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            {question.answers.length} Answer{question.answers.length !== 1 ? "s" : ""}
          </h2>
        </div>

        <AnswerList
          questionId={question._id}
          acceptedAnswerId={question.acceptedAnswer}
          questionAuthorId={question.author._id}
          onAnswerUpdate={fetchQuestion}
        />

        {user && <AnswerForm questionId={question._id} onAnswerAdded={handleAnswerAdded} />}
      </div>
    </motion.div>
  )
}
