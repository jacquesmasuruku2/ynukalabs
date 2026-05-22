import { Button } from "./button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface CustomButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  asChild?: boolean;
}

const CustomButton = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className,
  onClick,
  type = "button",
  disabled = false,
  ...props
}: CustomButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/92 shadow-md hover:shadow-lg focus:ring-primary border border-black/[0.06]",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary",
    outline: "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground focus:ring-border"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <Button
      type={type}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        loading && "opacity-70 cursor-not-allowed",
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
};

export default CustomButton;
