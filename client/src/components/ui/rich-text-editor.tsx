import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bold, Italic, Underline, List, ListOrdered, Link } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const [selectedText, setSelectedText] = useState("");

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    const newText = `${beforeText}${prefix}${selectedText}${suffix}${afterText}`;
    onChange(newText);

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const formatButtons = [
    { icon: Bold, action: () => insertMarkdown("**", "**"), title: "Bold" },
    { icon: Italic, action: () => insertMarkdown("*", "*"), title: "Italic" },
    { icon: Underline, action: () => insertMarkdown("<u>", "</u>"), title: "Underline" },
    { icon: List, action: () => insertMarkdown("\n- "), title: "Bullet List" },
    { icon: ListOrdered, action: () => insertMarkdown("\n1. "), title: "Numbered List" },
    { icon: Link, action: () => insertMarkdown("[", "](url)"), title: "Link" },
  ];

  return (
    <div className={`border border-medical-gray-300 rounded-lg ${className}`}>
      <div className="flex items-center space-x-2 px-4 py-3 border-b border-medical-gray-200 bg-medical-gray-50">
        {formatButtons.map((button, index) => (
          <Button
            key={index}
            type="button"
            variant="ghost"
            size="sm"
            onClick={button.action}
            title={button.title}
            className="p-1 h-8 w-8 hover:bg-medical-gray-200"
          >
            <button.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-0 resize-none focus:ring-0 focus:outline-none min-h-32"
      />
    </div>
  );
}
