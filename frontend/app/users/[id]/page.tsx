"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { 
  User, 
  Calendar, 
  Mail, 
  Award, 
  FileText, 
  MessageSquare, 
  Eye, 
  TrendingUp,
  Clock,
  CheckCircle,
  Flag
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface UserProfile {
  _id: string
  username: string
  email: string
  role: "user" | "admin"
  avatar: string
  reputation: number
  banned: boolean
  createdAt: string
  lastLogin?: string
}

interface Question {
  _id: string
  title: string
  description: string
  views: number
  votes: number
  answers: string[]
  acceptedAnswer?: string
  createdAt: string
  tags: Array<{
    _id: string
    name: string
  }>
}

interface Answer {
  _id: string
  content: string
  votes: number
  isAccepted: boolean
  createdAt: string
  question: {
    _id: string
    title: string
  }
}

export default function UserProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const { user: currentUser } = useAuth()
  const { toast } = useToast()
  
  const [user, setUser] = useState<UserProfile | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchUserProfile()
  }, [userId])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      
      // Fetch user data
      const userResponse = await fetch(`/api/users/${userId}`)
      if (!userResponse.ok) {
        throw new Error("User not found")
      }
      const userData = await userResponse.json()
      setUser(userData.data)

      // Fetch user's questions
      const questionsResponse = await fetch(`/api/users/${userId}/questions`)
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json()
        setQuestions(questionsData.data || [])
      }

      // Fetch user's answers
      const answersResponse = await fetch(`/api/users/${userId}/answers`)
      if (answersResponse.ok) {
        const answersData = await answersResponse.json()
        setAnswers(answersData.data || [])
      }

    } catch (error) {
      console.error("Error fetching user profile:", error)
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 bg-muted rounded-full"></div>
              <div className="space-y-2">
                <div className="h-8 bg-muted rounded w-48"></div>
                <div className="h-4 bg-muted rounded w-32"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-card border rounded-lg p-6 space-y-4">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The user you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = {
    questions: questions.length,
    answers: answers.length,
    acceptedAnswers: answers.filter(a => a.isAccepted).length,
    totalViews: questions.reduce((sum, q) => sum + q.views, 0),
    totalVotes: questions.reduce((sum, q) => sum + q.votes, 0) + 
                answers.reduce((sum, a) => sum + a.votes, 0)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        {/* User Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
                <AvatarFallback className="text-2xl">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{user.username}</h1>
                  {user.role === "admin" && (
                    <Badge variant="default" className="bg-green-500">
                      <Award className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                  {user.banned && (
                    <Badge variant="destructive">
                      <Flag className="h-3 w-3 mr-1" />
                      Banned
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span>{user.reputation} reputation</span>
                  </div>
                  {currentUser?.role === "admin" && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {currentUser?.role === "admin" && currentUser._id !== user._id && (
                <Button variant="outline" className="gap-2">
                  <Flag className="h-4 w-4" />
                  {user.banned ? "Unban User" : "Ban User"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.questions}</p>
                  <p className="text-sm text-muted-foreground">Questions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.answers}</p>
                  <p className="text-sm text-muted-foreground">Answers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.acceptedAnswers}</p>
                  <p className="text-sm text-muted-foreground">Accepted</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalViews}</p>
                  <p className="text-sm text-muted-foreground">Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalVotes}</p>
                  <p className="text-sm text-muted-foreground">Votes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
            <TabsTrigger value="answers">Answers ({answers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest questions and answers from {user.username}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {questions.length === 0 && answers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No activity yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {questions.slice(0, 3).map((question) => (
                      <div key={question._id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <div className="flex-1">
                          <Link href={`/questions/${question._id}`} className="font-medium hover:text-primary">
                            {question.title}
                          </Link>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{question.views} views</span>
                            <span>{question.votes} votes</span>
                            <span>{question.answers.length} answers</span>
                            <span>{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {answers.slice(0, 3).map((answer) => (
                      <div key={answer._id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <MessageSquare className="h-4 w-4 text-green-500" />
                        <div className="flex-1">
                          <Link href={`/questions/${answer.question._id}`} className="font-medium hover:text-primary">
                            {answer.question.title}
                          </Link>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{answer.votes} votes</span>
                            {answer.isAccepted && (
                              <Badge variant="default" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Accepted
                              </Badge>
                            )}
                            <span>{formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            {questions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Questions Yet</h3>
                  <p className="text-muted-foreground">
                    {user.username} hasn't asked any questions yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              questions.map((question) => (
                <motion.div
                  key={question._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link href={`/questions/${question._id}`}>
                            <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                              {question.title}
                            </h3>
                          </Link>
                          <p className="text-muted-foreground mt-2 line-clamp-2">
                            {question.description}
                          </p>
                          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                            <span>{question.views} views</span>
                            <span>{question.votes} votes</span>
                            <span>{question.answers.length} answers</span>
                            <span>{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {question.tags.map((tag) => (
                              <Badge key={tag._id} variant="secondary">
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>

          <TabsContent value="answers" className="space-y-4">
            {answers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Answers Yet</h3>
                  <p className="text-muted-foreground">
                    {user.username} hasn't answered any questions yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              answers.map((answer) => (
                <motion.div
                  key={answer._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link href={`/questions/${answer.question._id}`}>
                            <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                              {answer.question.title}
                            </h3>
                          </Link>
                          <p className="text-muted-foreground mt-2 line-clamp-3">
                            {answer.content}
                          </p>
                          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                            <span>{answer.votes} votes</span>
                            {answer.isAccepted && (
                              <Badge variant="default" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Accepted
                              </Badge>
                            )}
                            <span>{formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
} 