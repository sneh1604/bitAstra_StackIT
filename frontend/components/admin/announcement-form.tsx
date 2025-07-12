"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Megaphone, Send, Users, Mail } from "lucide-react"

export function AnnouncementForm() {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both subject and message fields.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send announcement")
      }

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Announcement sent successfully to all users.",
        })
        
        // Reset form
        setSubject("")
        setMessage("")
      } else {
        throw new Error(data.error || "Failed to send announcement")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send announcement",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Platform Announcements
          </CardTitle>
          <CardDescription>
            Send important announcements to all users on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-semibold">All Users</p>
                <p className="text-sm text-muted-foreground">Will receive this announcement</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Mail className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="font-semibold">Email + Notification</p>
                <p className="text-sm text-muted-foreground">Sent via email and in-app</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Send className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="font-semibold">Immediate Delivery</p>
                <p className="text-sm text-muted-foreground">Sent instantly to all users</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Announcement Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create Announcement</CardTitle>
          <CardDescription>
            Write a clear and concise announcement for all platform users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter announcement subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={100}
                required
              />
              <p className="text-sm text-muted-foreground">
                {subject.length}/100 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your announcement message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                maxLength={1000}
                required
              />
              <p className="text-sm text-muted-foreground">
                {message.length}/1000 characters
              </p>
            </div>

            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={loading || !subject.trim() || !message.trim()}
                className="gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send Announcement
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setSubject("")
                  setMessage("")
                }}
              >
                Clear Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview Card */}
      {(subject || message) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                How your announcement will appear to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subject && (
                  <div>
                    <Label className="text-sm font-medium">Subject</Label>
                    <p className="text-lg font-semibold mt-1">{subject}</p>
                  </div>
                )}
                {message && (
                  <div>
                    <Label className="text-sm font-medium">Message</Label>
                    <div className="mt-1 p-4 bg-muted rounded-lg">
                      <p className="whitespace-pre-wrap">{message}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Announcement Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium">Be Clear and Concise</p>
                <p className="text-sm text-muted-foreground">
                  Use simple language that all users can understand
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium">Include Important Details</p>
                <p className="text-sm text-muted-foreground">
                  Provide dates, times, and any relevant information
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium">Use Appropriate Tone</p>
                <p className="text-sm text-muted-foreground">
                  Be professional but friendly in your communication
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium">Consider Impact</p>
                <p className="text-sm text-muted-foreground">
                  Announcements are sent to all users, so choose content carefully
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 