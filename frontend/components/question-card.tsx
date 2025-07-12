"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { VoteButtons } from "@/components/vote-buttons"
import { motion } from "framer-motion"
import { MessageSquare, Eye, Clock, CheckCircle, MoreHorizontal, Flag } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

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

interface QuestionCardProps {
  question: Question
}

export function QuestionCard({ question }: QuestionCardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [userVote, setUserVote] = useState<number | null>(null)

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

  const truncateDescription = (text: string, maxLength = 150) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary">
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Vote Section */}
            <div className="flex flex-col items-center space-y-2 min-w-[60px]">
              <VoteButtons
                itemId={question._id}
                itemType="question"
                votes={question.votes}
                userVote={userVote}
                onVoteChange={setUserVote}
              />

              <div className="flex flex-col items-center text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{question.answers.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{question.views}</span>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <Link href={`/questions/${question._id}`} className="group">
                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-2">
                    {question.title}
                  </h3>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleReport} className="gap-2">
                      <Flag className="h-4 w-4" />
                      Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="text-muted-foreground">{truncateDescription(question.description)}</p>

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

              {/* Author and Timestamp */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link href={`/users/${question.author._id}`}>
                    <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={question.author.avatar || "/placeholder.svg"}
                          alt={question.author.username}
                        />
                        <AvatarFallback className="text-xs">
                          {question.author.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <span className="font-medium">{question.author.username}</span>
                        <span className="text-muted-foreground ml-1">({question.author.reputation} rep)</span>
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {question.acceptedAnswer && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Solved</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
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
