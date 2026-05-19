import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface EventCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

const cardVariants = {
  initial: { 
    opacity: 0, 
    y: 40,
    scale: 0.95
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1
  },
  hover: { 
    y: -8,
    scale: 1.02
  }
};

const EventCard = ({ 
  children, 
  className, 
  hover = true,
  delay = 0 
}: EventCardProps) => {
  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      whileHover={hover ? "hover" : undefined}
      viewport={{ once: true, margin: "-100px" }}
      variants={cardVariants}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-100 p-6",
        "transition-all duration-300",
        hover && "cursor-pointer",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default EventCard;
