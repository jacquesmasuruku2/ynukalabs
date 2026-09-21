import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-medium ring-offset-background transition-[transform,filter,colors,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:hover:scale-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/92 hover:scale-[1.05] hover:brightness-110 active:scale-[0.98]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-[1.02]",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-muted hover:text-foreground hover:scale-[1.03]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/85 hover:scale-[1.02]",
        ghost: "hover:bg-muted/80 hover:text-foreground dark:hover:bg-white/10",
        link: "text-primary underline-offset-4 hover:underline hover:scale-100",
        glow:
          "bg-primary text-primary-foreground glow-cyan font-display font-semibold tracking-wide hover:scale-[1.05] hover:brightness-110 active:scale-[0.98]",
        "outline-glow":
          "border border-primary/60 text-primary hover:bg-primary/10 hover:scale-[1.03] font-display font-semibold tracking-wide",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-[10px] px-3",
        lg: "h-11 rounded-[10px] px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
