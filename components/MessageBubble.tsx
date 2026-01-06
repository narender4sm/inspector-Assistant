import React from 'react';
import { Message, MessageRole } from '../types';
import { User, Bot, Loader2 } from 'lucide-react';
// A simple markdown parser could be used here, but for simplicity we'll handle newlines and links
// In a real app, use 'react-markdown'

interface MessageBubbleProps {
  message: Message;
}

const formatContent = (text: string) => {
  // Simple regex to convert markdown links [text](url) to <a> tags
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = text.split(linkRegex);
  
  if (parts.length === 1) return <div className="whitespace-pre-wrap">{text}</div>;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  
  text.replace(linkRegex, (match, linkText, url, offset) => {
    // Push preceding text
    if (offset > lastIndex) {
      elements.push(<span key={lastIndex}>{text.substring(lastIndex, offset)}</span>);
    }
    // Push link
    elements.push(
      <a 
        key={offset} 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline font-medium"
      >
        {linkText}
      </a>
    );
    lastIndex = offset + match.length;
    return match;
  });

  // Push remaining text
  if (lastIndex < text.length) {
    elements.push(<span key={lastIndex}>{text.substring(lastIndex)}</span>);
  }

  return <div className="whitespace-pre-wrap">{elements}</div>;
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === MessageRole.USER;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div 
            className={`px-4 py-3 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed
              ${isUser 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
              }`}
          >
            {message.isThinking ? (
              <div className="flex items-center gap-2 text-slate-500">
                <Loader2 className="animate-spin" size={16} />
                <span className="text-xs">Accessing database...</span>
              </div>
            ) : (
              formatContent(message.content)
            )}
          </div>
          <span className="text-xs text-slate-400 mt-1 px-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};