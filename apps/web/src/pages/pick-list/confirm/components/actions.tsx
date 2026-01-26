import { Row } from '@tanstack/react-table'
import { Button } from '@/components/custom/button'
import { PickListItem } from '@/types'
import { PlayIcon } from 'lucide-react'

interface DataTableRowActionsProps {
  row: Row<PickListItem>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  return (
    <div className='flex gap-2'>
      <Button
        size={'sm'}
        onClick={() => {
          window.location.href = `/order/${row.original.id}/process`
        }}
        className=' rounded px-4 py-2 text-xs text-foreground'
        type='button'
        variant={'outline'}
      >
        <span className='mr-2'>Confirm </span> <PlayIcon size={16} />
      </Button>
    </div>
  )
}
