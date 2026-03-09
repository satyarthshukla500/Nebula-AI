import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border shadow-sm',
          className
        )}
        style={{
          background: 'transparent',
          borderColor: 'rgba(255,255,255,0.08)',
          ...props.style
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export const CardHeader = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('px-6 py-4 border-b', className)}
        style={{
          borderColor: 'rgba(255,255,255,0.08)',
          ...props.style
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

export const CardBody = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('px-6 py-4', className)} {...props}>
        {children}
      </div>
    )
  }
)

CardBody.displayName = 'CardBody'

export const CardFooter = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('px-6 py-4 border-t', className)}
        style={{
          borderColor: 'rgba(255,255,255,0.08)',
          ...props.style
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardFooter.displayName = 'CardFooter'
