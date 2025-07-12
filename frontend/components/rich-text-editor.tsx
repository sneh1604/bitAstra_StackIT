"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { common, createLowlight } from "lowlight"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  LinkIcon,
  ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Smile,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"

// Create lowlight instance with common languages
const lowlight = createLowlight(common)

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right" | "justify">("left")
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable default code block to use lowlight version
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "javascript",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4",
        style: `text-align: ${textAlign};`,
      },
    },
  })

  // Update editor alignment when textAlign state changes
  useEffect(() => {
    if (editor) {
      const editorElement = editor.view.dom
      if (editorElement) {
        editorElement.style.textAlign = textAlign
      }
    }
  }, [textAlign, editor])

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  if (!editor) {
    return null
  }

  const addLink = () => {
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run()
      return
    }

    const url = window.prompt("Enter URL:")
    if (url) {
      const text = window.prompt("Enter link text (optional):")
      if (text) {
        editor.chain().focus().setLink({ href: url }).insertContent(text).run()
      } else {
        editor.chain().focus().setLink({ href: url }).run()
      }
    }
  }

  const addImage = () => {
    const url = window.prompt("Enter image URL:")
    if (url) {
      editor.chain().focus().setImage({ src: url, alt: "Image" }).run()
    }
  }

  const insertEmoji = (emoji: string) => {
    editor.chain().focus().insertContent(emoji).run()
    setShowEmojiPicker(false)
  }

  const setAlignment = (alignment: "left" | "center" | "right" | "justify") => {
    setTextAlign(alignment)
  }

  const commonEmojis = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
    "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
    "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩",
    "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣",
    "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬",
    "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗",
    "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😯", "😦", "😧",
    "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢",
    "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "💩", "👻", "💀",
    "☠️", "👽", "👾", "🤖", "😺", "😸", "😹", "😻", "😼", "😽",
    "🙀", "😿", "😾", "🙈", "🙉", "🙊", "💌", "💘", "💝", "💖",
    "💗", "💓", "💞", "💕", "💟", "❣️", "💔", "❤️", "🧡", "💛",
    "💚", "💙", "💜", "🖤", "💯", "💢", "💥", "💫", "💦", "💨",
    "🕳️", "💬", "🗨️", "🗯️", "💭", "💤", "💋", "💯", "💢", "💥",
    "💫", "💦", "💨", "🕳️", "💬", "🗨️", "🗯️", "💭", "💤", "💋"
  ]

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <Button
          variant={editor.isActive("bold") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          variant={editor.isActive("italic") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          variant={editor.isActive("strike") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <Button
          variant={editor.isActive("code") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Code"
        >
          <Code className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Lists */}
        <Button
          variant={editor.isActive("bulletList") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          variant={editor.isActive("orderedList") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button
          variant={editor.isActive("blockquote") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Text Alignment */}
        <Button
          variant={textAlign === "left" ? "default" : "ghost"}
          size="sm"
          onClick={() => setAlignment("left")}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>

        <Button
          variant={textAlign === "center" ? "default" : "ghost"}
          size="sm"
          onClick={() => setAlignment("center")}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>

        <Button
          variant={textAlign === "right" ? "default" : "ghost"}
          size="sm"
          onClick={() => setAlignment("right")}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <Button
          variant={textAlign === "justify" ? "default" : "ghost"}
          size="sm"
          onClick={() => setAlignment("justify")}
          title="Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Links and Media */}
        <Button 
          variant={editor.isActive("link") ? "default" : "ghost"} 
          size="sm" 
          onClick={addLink}
          title="Add Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm" onClick={addImage} title="Add Image">
          <ImageIcon className="h-4 w-4" />
        </Button>

        {/* Emoji Picker */}
        <div className="relative" ref={emojiPickerRef}>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Insert Emoji"
          >
            <Smile className="h-4 w-4" />
          </Button>
          
          {showEmojiPicker && (
            <div className="absolute top-full left-0 z-50 bg-white border rounded-lg shadow-lg p-2 max-w-64 max-h-64 overflow-y-auto">
              <div className="grid grid-cols-8 gap-1">
                {commonEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    className="p-1 hover:bg-gray-100 rounded text-lg"
                    onClick={() => insertEmoji(emoji)}
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div className="min-h-[200px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

