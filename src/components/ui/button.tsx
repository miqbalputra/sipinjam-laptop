import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border-2 border-black text-sm font-bold whitespace-nowrap transition-all outline-none select-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:pointer-events-none disabled:opacity-50 rounded-[5px]",
  {
    variants: {
      variant: {
        default: "bg-[#A388EE] text-black neo-shadow hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
        outline:
          "bg-white text-black neo-shadow hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
        secondary:
          "bg-[#FFD033] text-black neo-shadow hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
        ghost:
          "border-transparent hover:bg-zinc-100 neo-shadow-none",
        destructive:
          "bg-[#FF5252] text-white neo-shadow hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
        link: "border-transparent text-primary underline-offset-4 hover:underline neo-shadow-none",
      },
      size: {
        default: "h-11 px-6",
        xs: "h-8 px-3 text-xs",
        sm: "h-10 px-4",
        lg: "h-13 px-8 text-lg",
        icon: "size-11",
        "icon-sm": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
