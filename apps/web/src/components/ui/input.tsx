import * as React from 'react'
import { XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'prefix'
> {
  clearable?: boolean
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      prefix,
      suffix,
      clearable,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const handleClear = (e: React.MouseEvent) => {
      e.preventDefault()
      if (onChange) {
        const event = {
          ...e,
          target: { value: '' },
        } as unknown as React.ChangeEvent<HTMLInputElement>
        onChange(event)
      }
    }

    const isClearVisible =
      clearable && typeof value === 'string' && value.length > 0

    return (
      <div
        className={cn(
          'flex h-9 items-center rounded-md border border-input bg-transparent px-2 text-sm shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring',
          className
        )}
      >
        {prefix && <div className='mr-2 shrink-0'>{prefix}</div>}

        <div className='relative flex w-full items-center'>
          <input
            ref={ref}
            type={type}
            className={cn(
              'w-full bg-transparent pr-6 placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
            )}
            value={value}
            onChange={onChange}
            {...props}
          />

          {isClearVisible && (
            <XIcon
              className='mx-2 text-muted-foreground hover:text-red-500'
              onClick={(e: React.MouseEvent<SVGSVGElement>) => {
                e.stopPropagation()
                handleClear(e)
              }}
              size={20}
            />
          )}
        </div>

        {suffix && <div className='ml-2 shrink-0'>{suffix}</div>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export { Input }
