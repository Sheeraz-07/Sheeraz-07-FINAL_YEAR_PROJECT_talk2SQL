import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-2xl border-2 border-input bg-background/50 backdrop-blur-sm px-4 py-2.5 text-base shadow-sm ring-offset-background font-semibold",
          "file:border-0 file:bg-transparent file:text-sm file:font-bold file:text-foreground",
          "placeholder:text-muted-foreground/60 placeholder:font-medium",
          "transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:border-accent focus-visible:shadow-lg focus-visible:shadow-accent/20 focus-visible:scale-[1.01]",
          "hover:border-accent/50 hover:shadow-md hover:bg-background",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-input",
          "md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
