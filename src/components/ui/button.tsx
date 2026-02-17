import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 relative overflow-hidden shadow-sm hover:shadow-lg",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-95 hover:brightness-110",
        destructive: "bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground hover:shadow-xl hover:shadow-destructive/30 hover:scale-105 active:scale-95 hover:brightness-110",
        outline: "border-2 border-input bg-background hover:bg-gradient-to-r hover:from-accent/10 hover:to-accent/5 hover:text-accent-foreground hover:border-accent hover:shadow-md hover:scale-105 active:scale-95",
        secondary: "bg-gradient-to-r from-secondary to-secondary/90 text-secondary-foreground hover:shadow-lg hover:scale-105 active:scale-95 hover:brightness-110",
        ghost: "hover:bg-gradient-to-r hover:from-accent/25 hover:to-accent/15 dark:hover:from-accent/35 dark:hover:to-accent/20 hover:text-accent-foreground hover:shadow-md active:scale-95",
        link: "text-accent underline-offset-4 hover:underline hover:text-accent/80",
        success: "bg-gradient-to-r from-success to-success/90 text-success-foreground hover:shadow-xl hover:shadow-success/30 hover:scale-105 active:scale-95 hover:brightness-110",
      },
      size: {
        default: "h-11 px-6 py-2.5 text-sm",
        sm: "h-9 rounded-xl px-4 text-xs",
        lg: "h-14 rounded-3xl px-10 text-base font-extrabold",
        icon: "h-11 w-11",
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
