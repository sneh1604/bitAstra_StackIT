"use client"

import { useState } from "react"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestEditorPage() {
  const [content, setContent] = useState("")
  const [savedContent, setSavedContent] = useState("")

  const handleSave = () => {
    setSavedContent(content)
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Rich Text Editor Test</h1>
        <p className="text-muted-foreground">
          Test all the rich text editor features: Bold, Italic, Strikethrough, Lists, Emojis, Links, Images, and Text Alignment
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Rich Text Editor</CardTitle>
            <CardDescription>
              Try all the features: Bold, Italic, Strikethrough, Numbered lists, Bullet points, 
              Emoji insertion, Hyperlink insertion, Image upload, and Text alignment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Start writing your content here..."
            />
            <div className="flex gap-2">
              <Button onClick={handleSave}>Save Content</Button>
              <Button variant="outline" onClick={() => setContent("")}>Clear</Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>See how your content will be displayed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 min-h-[200px] bg-muted/20">
              {savedContent ? (
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: savedContent }}
                />
              ) : (
                <p className="text-muted-foreground">No content saved yet. Click "Save Content" to see the preview.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Available Features</CardTitle>
          <CardDescription>All features are fully functional and working</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Text Formatting</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Bold text</li>
                <li>• Italic text</li>
                <li>• Strikethrough text</li>
                <li>• Inline code</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Lists & Structure</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Bullet points</li>
                <li>• Numbered lists</li>
                <li>• Blockquotes</li>
                <li>• Code blocks</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Text Alignment</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Left align</li>
                <li>• Center align</li>
                <li>• Right align</li>
                <li>• Justify text</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Media & Links</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Hyperlink insertion</li>
                <li>• Image upload (URL)</li>
                <li>• Emoji insertion</li>
                <li>• Rich link styling</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Editor Controls</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Undo/Redo</li>
                <li>• Click outside to close pickers</li>
                <li>• Toolbar with tooltips</li>
                <li>• Responsive design</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">User Experience</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Visual feedback</li>
                <li>• Keyboard shortcuts</li>
                <li>• Accessible design</li>
                <li>• Error-free operation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 