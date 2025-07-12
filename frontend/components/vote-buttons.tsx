"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { ChevronUp, ChevronDown } from "lucide-react"

interface VoteButtonsProps {
  itemId: string
  itemType: "question" | "answer"
  votes: number
  userVote: number | null
  onVoteChange: (newVote: number | null) => void
}

export function VoteButtons({ itemId, itemType, votes: initialVotes, userVote, onVoteChange }: VoteButtonsProps) {
  const [votes, setVotes] = useState(initialVotes)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleVote = async (value: 1 | -1) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to vote",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/vote/${itemType}/${itemId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ value }),
      })

      const data = await response.json()

      if (data.success) {
        setVotes(data.data.votes)
        onVoteChange(data.data.userVote)

        // Show feedback animation
        toast({
          title: value === 1 ? "Upvoted!" : "Downvoted!",
          description: `You ${value === 1 ? "upvoted" : "downvoted"} this ${itemType}`,
        })
      } else {
        throw new Error(data.error || "Vote failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to vote",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-1">
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant={userVote === 1 ? "default" : "ghost"}
          size="sm"
          onClick={() => handleVote(1)}
          disabled={loading}
          className="h-8 w-8 p-0"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      </motion.div>

      <motion.div
        key={votes}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        className={`text-lg font-semibold ${
          userVote === 1 ? "text-green-600" : userVote === -1 ? "text-red-600" : "text-foreground"
        }`}
      >
        {votes}
      </motion.div>

      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant={userVote === -1 ? "destructive" : "ghost"}
          size="sm"
          onClick={() => handleVote(-1)}
          disabled={loading}
          className="h-8 w-8 p-0"
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      </motion.div>
    </div>
  )
}
