import { IconUserPlus } from '@tabler/icons-react'
import { useUsers } from '../context/users-context'
import { Button } from '@/components/custom/button'

export function UsersPrimaryButtons() {
  const { setOpen } = useUsers()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add User</span> <IconUserPlus size={18} />
      </Button>
    </div>
  )
}
