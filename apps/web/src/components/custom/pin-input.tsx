import * as React from 'react'
import { cn } from '@/lib/utils'

type PinType = 'numeric' | 'alphanumeric'

interface PinInputContextValue {
  values: string[]
  register(index: number, node: HTMLInputElement | null): void
  setValue(index: number, value: string): void
  focus(index: number): void
  disabled: boolean
  readOnly: boolean
  mask: boolean
  type: PinType
  placeholder: string
}

const PinInputContext = React.createContext<PinInputContextValue | null>(null)

export interface PinInputProps {
  children: React.ReactNode
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
  onIncomplete?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  mask?: boolean
  type?: PinType
  className?: string
}

export function PinInput({
  children,
  value,
  defaultValue = '',
  onChange,
  onComplete,
  onIncomplete,
  placeholder = '○',
  disabled = false,
  readOnly = false,
  mask = false,
  type = 'numeric',
  className,
}: PinInputProps) {
  const count = React.Children.toArray(children).filter(
    (c) =>
      React.isValidElement(c) && (c.type as any).displayName === 'PinInputField'
  ).length

  const controlled = value !== undefined
  const [internal, setInternal] = React.useState(
    defaultValue.padEnd(count).slice(0, count).split('')
  )

  const refs = React.useRef(new Map<number, HTMLInputElement>())
  const values = controlled
    ? (value ?? '').padEnd(count).slice(0, count).split('')
    : internal

  const register = (i: number, n: HTMLInputElement | null) => {
    if (n) refs.current.set(i, n)
    else refs.current.delete(i)
  }
  const focus = (i: number) => refs.current.get(i)?.focus()

  const emit = (next: string[]) => {
    const pin = next.join('').trim()
    onChange?.(pin)
    if (pin.length === count) onComplete?.(pin)
    else onIncomplete?.(pin)
  }

  const setValue = (i: number, v: string) => {
    const next = [...values]
    next[i] = v
    if (!controlled) setInternal(next)
    emit(next)
    if (v && i < count - 1) focus(i + 1)
  }

  const ctx: PinInputContextValue = {
    values,
    register,
    setValue,
    focus,
    disabled,
    readOnly,
    mask,
    type,
    placeholder,
  }

  let index = 0
  const rendered = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child
    if ((child.type as any).displayName !== 'PinInputField') return child
    return React.cloneElement(child as React.ReactElement<any>, {
      index: index++,
    })
  })

  return (
    <PinInputContext.Provider value={ctx}>
      <div className={className}>{rendered}</div>
    </PinInputContext.Provider>
  )
}

export interface PinInputFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> {
  component?: React.ElementType
  index?: number
}

export const PinInputField = React.forwardRef<
  HTMLInputElement,
  PinInputFieldProps
>(
  (
    {
      component: Component = 'input',
      index = 0,
      className,
      onKeyDown,
      onPaste,
      ...props
    },
    ref
  ) => {
    const ctx = React.useContext(PinInputContext)
    if (!ctx) throw new Error('PinInputField must be used inside PinInput')
    return (
      <Component
        {...props}
        ref={(n: any) => {
          ctx.register(index, n)
          if (typeof ref === 'function') ref(n)
          else if (ref) (ref as any).current = n
        }}
        className={cn('size-10 text-center', className)}
        value={ctx.values[index] ?? ''}
        placeholder={ctx.placeholder}
        disabled={ctx.disabled}
        readOnly={ctx.readOnly}
        type={ctx.mask ? 'password' : ctx.type === 'numeric' ? 'tel' : 'text'}
        inputMode={ctx.type === 'numeric' ? 'numeric' : 'text'}
        onChange={(e: any) => ctx.setValue(index, e.target.value.slice(-1))}
        onKeyDown={(e: any) => {
          if (e.key === 'Backspace') {
            e.preventDefault()
            ctx.setValue(index, '')
            ctx.focus(index - 1)
          }
          onKeyDown?.(e)
        }}
        onPaste={(e: any) => {
          e.preventDefault()
          const t = e.clipboardData.getData('text')
          t.split('').forEach((c: string, i: number) => {
            if (i + index < ctx.values.length) ctx.setValue(i + index, c)
          })
          onPaste?.(e)
        }}
      />
    )
  }
)
PinInputField.displayName = 'PinInputField'
