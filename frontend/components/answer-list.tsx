"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { VoteButtons } from "@/components/vote-buttons"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Edit, Trash2, Flag, MoreHorizontal } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Answer {
  _id: string
  content: string
  author: {
    _id: string
    username: string
    avatar: string
    reputation: number
  }
  votes: number
  isAccepted: boolean
  comments: Array<{
    text: string
    author: {
      _id: string
      username: string
    }
    createdAt: string
  }>
  createdAt: string
  updatedAt: string
}

interface AnswerListProps {
  questionId: string
  acceptedAnswerId?: string
  questionAuthorId: string
  onAnswerUpdate: () => void
}

export function AnswerList({ questionId, acceptedAnswerId, questionAuthorId, onAnswerUpdate }: AnswerListProps) {
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchAnswers()
  }, [questionId])

  const fetchAnswers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/answers/${questionId}/answers`)
      const data = await response.json()

      if (data.success) {
        // Sort answers: accepted first, then by votes
        const sortedAnswers = data.data.sort((a: Answer, b: Answer) => {
          if (a.isAccepted && !b.isAccepted) return -1
          if (!a.isAccepted && b.isAccepted) return 1
          return b.votes - a.votes
        })
        setAnswers(sortedAnswers)
      }
    } catch (error) {
      console.error("Error fetching answers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptAnswer = async (answerId: string) => {
    try {
      const response = await fetch(`/api/answers/${answerId}/accept`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Answer Accepted",
          description: "This answer has been marked as the accepted solution.",
        })
        fetchAnswers()
        onAnswerUpdate()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept answer",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAnswer = async (answerId: string) => {
    if (!confirm("Are you sure you want to delete this answer?")) return

    try {
      const response = await fetch(`/api/answers/${answerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Answer Deleted",
          description: "The answer has been successfully deleted.",
        })
        fetchAnswers()
        onAnswerUpdate()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete answer",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-16 h-20 bg-muted rounded"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    )
  }

  if (answers.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="text-6xl">💭</div>
        <h3 className="text-xl font-semibold">No answers yet</h3>
        <p className="text-muted-foreground">Be the first to answer this question!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {answers.map((answer, index) => (
          <motion.div
            key={answer._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={answer.isAccepted ? "border-green-500 bg-green-50/50 dark:bg-green-950/20" : ""}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Vote Section */}
                  <div className="flex flex-col items-center space-y-2">
                    <VoteButtons
                      itemId={answer._id}
                      itemType="answer"
                      votes={answer.votes}
                      userVote={null}
                      onVoteChange={() => {}}
                    />

                    {/* Accept Button */}
                    {user?.id === questionAuthorId && !acceptedAnswerId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAcceptAnswer(answer._id)}
                        className="gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Accept
                      </Button>
                    )}

                    {answer.isAccepted && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-5 w-5 fill-current" />
                        <span className="text-sm font-medium">Accepted</span>
                      </div>
                    )}
                  </div>

                  {/* Answer Content */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div
                        className="prose prose-sm max-w-none flex-1"
                        dangerouslySetInnerHTML={{ __html: answer.content }}
                      />

                      {/* Actions Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {(user?.id === answer.author._id || user?.role === "admin") && (
                            <>
                              <DropdownMenuItem className="gap-2">
                                <Edit className="h-4 w-4" />
                                Edit Answer
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteAnswer(answer._id)}
                                className="gap-2 text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Answer
                              </DropdownMenuItem>
                            </>
                          )}
                          {user?.id !== answer.author._id && (
                            <DropdownMenuItem className="gap-2">
                              <Flag className="h-4 w-4" />
                              Report
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Author Info */}
                    <div className="flex justify-end">
                      <div className="bg-muted/50 rounded-lg p-3 max-w-sm">
                        <p className="text-sm text-muted-foreground mb-2">
                          Answered {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
                        </p>
                        <Link href={`/users/${answer.author._id}`}>
                          <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={answer.author.avatar || "/placeholder.svg"}
                                alt={answer.author.username}
                              />
                              <AvatarFallback className="text-xs">
                                {answer.author.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{answer.author.username}</p>
                              <p className="text-xs text-muted-foreground">{answer.author.reputation} reputation</p>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Comments */}
                    {answer.comments.length > 0 && (
                      <div className="border-t pt-4 space-y-2">
                        {answer.comments.map((comment, commentIndex) => (
                          <div key={commentIndex} className="text-sm bg-muted/30 rounded p-3">
                            <p>{comment.text}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {comment.author.username} •{" "}
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
