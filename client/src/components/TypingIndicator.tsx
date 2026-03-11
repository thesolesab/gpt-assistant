import { motion } from "framer-motion";

export function TypingIndicator() {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -6 },
  };

  const containerVariants = {
    initial: { opacity: 0, scale: 0.9, y: 10 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { staggerChildren: 0.15 },
    },
  };

  return (
    <div className="flex w-full justify-start mb-6">
      <div className="flex flex-col max-w-[85%] sm:max-w-[70%]">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
            <SparklesIcon className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground ml-1">Assistant</span>
        </div>
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="bg-card text-card-foreground px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm border border-border/40 inline-flex items-center gap-1.5 w-16 h-11"
        >
          {[0, 1, 2].map((dot) => (
            <motion.div
              key={dot}
              variants={dotVariants}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              className="w-1.5 h-1.5 bg-primary/60 rounded-full"
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
