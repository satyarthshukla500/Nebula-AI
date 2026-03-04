import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-lg border border-gray-200 shadow-sm',
          className
        )}
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
        className={cn('px-6 py-4 border-b border-gray-200', className)}
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
        className={cn('px-6 py-4 border-t border-gray-200', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardFooter.displayName = 'CardFooter'
