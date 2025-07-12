"use client"

import { useState, useEffect, useCallback } from "react"
import { QuestionCard } from "@/components/question-card"
import { SearchBar } from "@/components/search-bar"
import { TagFilter } from "@/components/tag-filter"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, Clock, Users } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { motion } from "framer-motion"

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

export default function HomePage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "unanswered">("newest")
  const { user } = useAuth()

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (selectedTags.length > 0) {
        params.append("tags", selectedTags.join(","))
      }
      // Remove the sort parameter - just use base endpoint
      // params.append("sort", sortBy)

      console.log(`Fetching questions with params: ${params.toString()}`)
      const response = await fetch(`/api/questions${params.toString() ? `?${params.toString()}` : ''}`)
      console.log(`Response status: ${response.status}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("API Error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log("Questions data:", data)

      if (data.success) {
        setQuestions(data.data || [])
        console.log(`Set ${data.data?.length || 0} questions`)
      } else {
        console.error("API returned success: false", data)
        throw new Error(data.error || "Failed to fetch questions")
      }
    } catch (error) {
      console.error("Error fetching questions:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch questions")
      // Set empty array to show "no questions" state
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }, [selectedTags]) // Remove sortBy from dependencies since we're not using it

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      fetchQuestions()
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log(`Searching questions with query: ${query}`)
      const response = await fetch(`/api/questions/search?q=${encodeURIComponent(query)}`)
      console.log(`Search response status: ${response.status}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Search API Error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log("Search results:", data)

      if (data.success) {
        setQuestions(data.data || [])
        console.log(`Set ${data.data?.length || 0} search results`)
      } else {
        console.error("Search API returned success: false", data)
        throw new Error(data.error || "Failed to search questions")
      }
    } catch (error) {
      console.error("Error searching questions:", error)
      setError(error instanceof Error ? error.message : "Failed to search questions")
      // Set empty array to show "no results" state
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }, [fetchQuestions])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Welcome to StackIt
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          A collaborative Q&A platform where knowledge meets community. Ask questions, share answers, and learn
          together.
        </p>
        {user && (
          <Link href="/ask">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Ask a Question
            </Button>
          </Link>
        )}
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <SearchBar onSearch={handleSearch} />
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <TagFilter selectedTags={selectedTags} onTagsChange={setSelectedTags} />
          <div className="flex gap-2">
            <Button
              variant={sortBy === "newest" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("newest")}
              className="gap-2"
            >
              <Clock className="h-4 w-4" />
              Newest
            </Button>
            <Button
              variant={sortBy === "popular" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("popular")}
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Popular
            </Button>
            <Button
              variant={sortBy === "unanswered" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("unanswered")}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Unanswered
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 border border-destructive/20 rounded-lg p-4"
        >
          <p className="text-destructive text-sm">
            <strong>Error:</strong> {error}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchQuestions}
            className="mt-2"
          >
            Retry
          </Button>
        </motion.div>
      )}

      {/* Questions List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-card border rounded-lg p-6 space-y-4">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-muted rounded w-16"></div>
                  <div className="h-6 bg-muted rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
          {questions.length === 0 ? (
            <motion.div variants={itemVariants} className="text-center py-12 space-y-4">
              <div className="text-6xl">🤔</div>
              <h3 className="text-xl font-semibold">No questions found</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedTags.length > 0
                  ? "Try adjusting your search or filters"
                  : "Be the first to ask a question!"}
              </p>
              {user && (
                <Link href="/ask">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Ask the First Question
                  </Button>
                </Link>
              )}
            </motion.div>
          ) : (
            <>
              <div className="text-sm text-muted-foreground mb-4">
                Showing {questions.length} question{questions.length !== 1 ? 's' : ''}
              </div>
              {questions.map((question) => (
                <motion.div key={question._id} variants={itemVariants}>
                  <QuestionCard question={question} />
                </motion.div>
              ))}
            </>
          )}
        </motion.div>
      )}
    </div>
  )
}
