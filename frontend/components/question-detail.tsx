"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { VoteButtons } from "@/components/vote-buttons"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Eye, Clock, Edit, Trash2, Flag, MoreHorizontal } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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

interface QuestionDetailProps {
  question: Question
  onUpdate: () => void
}

export function QuestionDetail({ question, onUpdate }: QuestionDetailProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [userVote, setUserVote] = useState<number | null>(null)

  const isAuthor = user?.id === question.author._id
  const isAdmin = user?.role === "admin"

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this question?")) return

    try {
      const response = await fetch(`/api/questions/${question._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Question Deleted",
          description: "The question has been successfully deleted.",
        })
        window.location.href = "/"
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      })
    }
  }

  const handleReport = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to report content",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          reportedItem: question._id,
          itemType: "question",
          reason: "Inappropriate content",
        }),
      })

      if (response.ok) {
        toast({
          title: "Report Submitted",
          description: "Thank you for helping keep our community safe",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive",
      })
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-4">{question.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{question.views} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Asked {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>

              {(isAuthor || isAdmin) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isAuthor && (
                      <DropdownMenuItem className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit Question
                      </DropdownMenuItem>
                    )}
                    {(isAuthor || isAdmin) && (
                      <DropdownMenuItem onClick={handleDelete} className="gap-2 text-destructive">
                        <Trash2 className="h-4 w-4" />
                        Delete Question
                      </DropdownMenuItem>
                    )}
                    {!isAuthor && (
                      <DropdownMenuItem onClick={handleReport} className="gap-2">
                        <Flag className="h-4 w-4" />
                        Report
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Content */}
            <div className="flex gap-6">
              {/* Vote Section */}
              <div className="flex flex-col items-center">
                <VoteButtons
                  itemId={question._id}
                  itemType="question"
                  votes={question.votes}
                  userVote={userVote}
                  onVoteChange={setUserVote}
                />
              </div>

              {/* Question Content */}
              <div className="flex-1 space-y-6">
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: question.description }} />

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {question.tags.map((tag) => (
                    <Link key={tag._id} href={`/tags/${tag._id}`}>
                      <Badge
                        variant="secondary"
                        className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                      >
                        {tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>

                {/* Author Info */}
                <div className="flex justify-end">
                  <div className="bg-muted/50 rounded-lg p-4 max-w-sm">
                    <p className="text-sm text-muted-foreground mb-2">
                      Asked {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                    </p>
                    <Link href={`/users/${question.author._id}`}>
                      <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={question.author.avatar || "/placeholder.svg"}
                            alt={question.author.username}
                          />
                          <AvatarFallback>{question.author.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{question.author.username}</p>
                          <p className="text-sm text-muted-foreground">{question.author.reputation} reputation</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
