import { format } from "date-fns";
import { User, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import type { Message } from "@shared/schema";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={clsx(
        "flex w-full mb-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={clsx(
          "flex flex-col max-w-[85%] sm:max-w-[70%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={clsx(
            "flex items-center gap-2 mb-2",
            isUser ? "flex-row-reverse" : "flex-row"
          )}
        >
          <div
            className={clsx(
              "flex items-center justify-center w-8 h-8 rounded-full shadow-sm",
              isUser
                ? "bg-gradient-to-br from-indigo-500 to-primary text-white"
                : "bg-primary/10 text-primary"
            )}
          >
            {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          </div>
          <span className="text-xs font-semibold text-muted-foreground mx-1">
            {isUser ? "You" : "Assistant"}
          </span>
        </div>

        <div
          className={clsx(
            "px-5 py-4 text-[15px] leading-relaxed shadow-sm break-words whitespace-pre-wrap",
            isUser
              ? "bg-gradient-to-br from-primary to-blue-600 text-white rounded-2xl rounded-tr-sm"
              : "bg-card text-card-foreground rounded-2xl rounded-tl-sm border border-border/40"
          )}
        >
          {message.content}
        </div>
        
        {message.createdAt && (
          <span className="text-[10px] text-muted-foreground mt-2 px-1">
            {format(new Date(message.createdAt), "h:mm a")}
          </span>
        )}
      </div>
    </motion.div>
  );
}
