import * as React from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { DayPicker } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/custom/button'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      classNames={{
        months: 'flex flex-col sm:flex-row gap-4',
        month: 'space-y-4',

        month_caption: 'relative flex justify-center items-center h-8',
        caption_label: 'text-sm font-medium',

        nav: 'flex items-center gap-1',

        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'absolute left-1 h-7 w-7 p-0'
        ),

        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'absolute right-1 h-7 w-7 p-0'
        ),

        weekdays: 'flex',
        weekday: 'w-8 text-muted-foreground text-[0.8rem] font-normal',

        week: 'flex mt-2',

        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-8 w-8 p-0 font-normal'
        ),

        selected: 'bg-primary text-primary-foreground',

        today: 'bg-accent text-accent-foreground',

        outside: 'text-muted-foreground opacity-50',

        disabled: 'opacity-50',

        hidden: 'invisible',
      }}
      components={{
        Chevron: ({ orientation, ...props }) =>
          orientation === 'left' ? (
            <ChevronLeftIcon {...props} />
          ) : (
            <ChevronRightIcon {...props} />
          ),
      }}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
