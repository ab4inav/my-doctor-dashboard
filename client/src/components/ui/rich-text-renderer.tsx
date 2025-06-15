import { cn } from "@/lib/utils";

interface RichTextRendererProps {
  content: string;
  className?: string;
}

export function RichTextRenderer({ content, className }: RichTextRendererProps) {
  // Function to parse and render formatted text
  const parseContent = (text: string) => {
    // Replace markdown-style formatting with HTML
    let parsedText = text
      // Bold text: **text** -> <strong>text</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic text: *text* -> <em>text</em>
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Keep underline HTML tags as is: <u>text</u>
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      // Bullet lists: - item -> <li>item</li>
      .replace(/^\- (.+)$/gm, '<li>$1</li>')
      // Numbered lists: 1. item -> <li>item</li>
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      // Line breaks
      .replace(/\n/g, '<br />');

    // Wrap consecutive <li> elements in <ul>
    parsedText = parsedText.replace(/(<li>.*?<\/li>)(\s*<li>.*?<\/li>)*/g, (match) => {
      return `<ul>${match}</ul>`;
    });

    return parsedText;
  };

  const formattedContent = parseContent(content);

  return (
    <div 
      className={cn("prose prose-sm max-w-none text-medical-gray-700", className)}
      dangerouslySetInnerHTML={{ __html: formattedContent }}
      style={{
        lineHeight: '1.6',
      }}
    />
  );
}