import { useState, useRef, useEffect } from "react";
import { Send, Mic, Square, Loader2 } from "lucide-react";
import { useChatHistory, useSendMessage } from "@/hooks/use-chat";
import { useSpeech } from "@/hooks/use-speech";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "@/components/ChatMessage";
import { TypingIndicator } from "@/components/TypingIndicator";

export default function Chat() {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: history = [], isLoading: isHistoryLoading } = useChatHistory();
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const { isListening, transcript, startListening, stopListening, error, isSupported } = useSpeech();
  const { toast } = useToast();

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isSending]);

  // Sync speech transcript dynamically while recording
  useEffect(() => {
    if (isListening && transcript) {
      setInputValue(transcript);
    }
  }, [transcript, isListening]);

  // Show toast on speech error
  useEffect(() => {
    if (error) {
      toast({
        title: "Microphone Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Stop listening if we were recording
    if (isListening) {
      stopListening();
    }
    
    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage || isSending) return;

    sendMessage(trimmedMessage, {
      onSuccess: () => {
        setInputValue("");
      },
      onError: (err) => {
        toast({
          title: "Failed to send message",
          description: err.message,
          variant: "destructive",
        });
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleRecording = () => {
    if (!isSupported) {
      toast({
        title: "Unsupported",
        description: "Your browser does not support speech recognition.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      stopListening();
      // Wait a tiny bit for the final transcript to process, then focus input
      setTimeout(() => document.getElementById('chat-input')?.focus(), 100);
    } else {
      startListening();
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-grid-pattern bg-background overflow-hidden relative">
      
      {/* Header */}
      <header className="absolute top-0 z-10 w-full glass-panel border-b-0 border-t-0 border-x-0 px-6 py-4 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
            </svg>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full"></span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Nexus AI</h1>
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              Always ready to help
            </p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto pt-24 pb-36 px-4 sm:px-6 scroll-smooth">
        <div className="max-w-4xl mx-auto flex flex-col justify-end min-h-full">
          
          {isHistoryLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 my-auto animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
              <p className="font-medium text-sm">Loading conversation...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center my-auto px-4">
              <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-6 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Nexus</h2>
              <p className="text-muted-foreground max-w-md">
                I'm a powerful AI assistant. Type a message or click the microphone to start our conversation.
              </p>
            </div>
          ) : (
            <div className="flex flex-col w-full pt-4">
              {history.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              
              {isSending && <TypingIndicator />}
              
              <div ref={messagesEndRef} className="h-1" />
            </div>
          )}
          
        </div>
      </main>

      {/* Input Area */}
      <div className="absolute bottom-0 z-10 w-full bg-gradient-to-t from-background via-background to-transparent pt-12 pb-6 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <form 
            onSubmit={handleSubmit}
            className="glass-panel rounded-3xl p-2 pl-6 flex items-end gap-3 transition-all duration-300 focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary/30 shadow-xl shadow-black/5"
          >
            <textarea
              id="chat-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening..." : "Type your message..."}
              className="flex-1 max-h-32 min-h-[44px] py-3 bg-transparent border-0 outline-none resize-none text-[15px] placeholder:text-muted-foreground/70"
              rows={1}
              disabled={isSending}
            />
            
            <div className="flex items-center gap-2 pb-1 pr-1">
              <button
                type="button"
                onClick={toggleRecording}
                disabled={isSending}
                className={`flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300 ${
                  isListening 
                    ? "bg-destructive text-white recording-pulse hover:bg-destructive/90" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105"
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                title={isListening ? "Stop recording" : "Use microphone"}
              >
                {isListening ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <button
                type="submit"
                disabled={!inputValue.trim() || isSending}
                className="flex items-center justify-center w-11 h-11 rounded-2xl bg-primary text-white shadow-md shadow-primary/25 hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300"
                title="Send message"
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 ml-0.5" />
                )}
              </button>
            </div>
          </form>
          
          <div className="text-center mt-3">
            <span className="text-[11px] font-medium text-muted-foreground/60 tracking-wide uppercase">
              AI generated content may be inaccurate
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
