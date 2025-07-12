"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { Flag, Eye, Trash2, CheckCircle, XCircle, Clock, User, MessageSquare, FileText, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Report {
  _id: string
  reportedItem: string
  itemType: "question" | "answer" | "user"
  reason: string
  status: "pending" | "resolved" | "dismissed"
  reporter: {
    _id: string
    username: string
    avatar: string
  }
  createdAt: string
  handledAt?: string
  handledBy?: {
    _id: string
    username: string
  }
}

export function ReportManagement() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/reports", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch reports")
      }

      const data = await response.json()
      if (data.success) {
        setReports(data.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResolveReport = async (reportId: string, action: "resolve" | "dismiss") => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/${action}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update report")
      }

      const data = await response.json()
      if (data.success) {
        // Update the report in the local state
        setReports(reports.map(report => 
          report._id === reportId 
            ? { 
                ...report, 
                status: action === "resolve" ? "resolved" : "dismissed",
                handledAt: new Date().toISOString(),
                handledBy: { _id: "admin", username: "Admin" }
              }
            : report
        ))

        toast({
          title: "Success",
          description: `Report ${action === "resolve" ? "resolved" : "dismissed"} successfully`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update report",
        variant: "destructive",
      })
    }
  }

  const filteredReports = reports.filter(report => 
    statusFilter === "all" || report.status === statusFilter
  )

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === "pending").length,
    resolved: reports.filter(r => r.status === "resolved").length,
    dismissed: reports.filter(r => r.status === "dismissed").length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "resolved":
        return "bg-green-500"
      case "dismissed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case "question":
        return FileText
      case "answer":
        return MessageSquare
      case "user":
        return User
      default:
        return Flag
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-card border rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-muted rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
                <div className="h-6 bg-muted rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.resolved}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-2xl font-bold">{stats.dismissed}</p>
                <p className="text-sm text-muted-foreground">Dismissed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Reports ({filteredReports.length})</CardTitle>
          <CardDescription>Review and manage user reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <AnimatePresence>
              {filteredReports.map((report) => {
                const ItemTypeIcon = getItemTypeIcon(report.itemType)
                return (
                  <motion.div
                    key={report._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={report.reporter.avatar} alt={report.reporter.username} />
                        <AvatarFallback>
                          {report.reporter.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{report.reporter.username}</h3>
                          <Badge variant="outline" className="text-xs">
                            <ItemTypeIcon className="h-3 w-3 mr-1" />
                            {report.itemType}
                          </Badge>
                          <Badge 
                            className={`text-xs ${getStatusColor(report.status)}`}
                          >
                            {report.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{report.reason}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>Reported: {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}</span>
                          {report.handledAt && (
                            <span>Resolved: {formatDistanceToNow(new Date(report.handledAt), { addSuffix: true })}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedReport(report)}
                          >
                            <Eye className="h-4 w-4" />
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Report Details</DialogTitle>
                            <DialogDescription>
                              Detailed information about this report
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Reporter</label>
                                <p className="text-sm text-muted-foreground">{report.reporter.username}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Item Type</label>
                                <p className="text-sm text-muted-foreground capitalize">{report.itemType}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Reason</label>
                                <p className="text-sm text-muted-foreground">{report.reason}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Status</label>
                                <p className="text-sm text-muted-foreground capitalize">{report.status}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Reported</label>
                                <p className="text-sm text-muted-foreground">
                                  {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                              {report.handledAt && (
                                <div>
                                  <label className="text-sm font-medium">Resolved</label>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDistanceToNow(new Date(report.handledAt), { addSuffix: true })}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {report.status === "pending" && (
                        <div className="flex gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="default" size="sm">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Resolve
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Resolve Report</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to resolve this report? This will mark it as handled.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleResolveReport(report._id, "resolve")}
                                >
                                  Resolve
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <XCircle className="h-4 w-4 mr-1" />
                                Dismiss
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Dismiss Report</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to dismiss this report? This will mark it as not requiring action.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleResolveReport(report._id, "dismiss")}
                                >
                                  Dismiss
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {filteredReports.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No reports found matching your criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 