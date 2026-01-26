import { HTMLAttributes, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/custom/button'
import { PasswordInput } from '@/components/custom/password-input'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'

import { login } from '@/lib/services'
import { useAuthStore } from '@/stores/authStore'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface UserAuthFormProps extends HTMLAttributes<HTMLDivElement> {}

// const presets = {
//   admin: { username: 'admin1@example.com', password: 'AdminTest123' },
//   superadmin: { username: 'superadmin@example.com', password: 'adminTest123' },
//   picker: { username: 'picker1@example.com', password: 'pickerTest123' },
// } as const

const formSchema = z.object({
  username: z
    .string()
    .min(1, { message: 'Please enter your username email' })
    .email({ message: 'Invalid username or email address' }),
  password: z
    .string()
    .min(1, {
      message: 'Please enter your password',
    })
    .min(7, {
      message: 'Password must be at least 7 characters long',
    }),
})

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const authStore = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    console.log('Submitting form...', data)
    try {
      const { data: userData } = await login(data)
      if (userData) {
        console.log('Login successful, navigating to /')
        toast({
          title: 'Login Successful',
          description: `Welcome, ${userData.username}!`,
        })
        authStore.setUser(userData)
        setTimeout(() => navigate('/'), 1000)
      } else {
        throw new Error('Invalid credentials')
      }
    } catch (error) {
      console.error('Login failed:', error)
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid gap-2'>
            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='name@example.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <div className='flex items-center justify-between'>
                    <FormLabel>Password</FormLabel>
                    {/* <Link
                      to='/forgot-password'
                      className='text-sm font-medium text-muted-foreground hover:opacity-75'
                    >
                      Forgot password?
                    </Link> */}
                  </div>
                  <FormControl>
                    <PasswordInput placeholder='********' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <FormItem className='space-y-1 ' >
              <FormLabel >Login as (Remove this element Later)</FormLabel>
              <Select onValueChange={(role: keyof typeof presets) => {
                form.setValue('username', presets[role].username)
                form.setValue('password', presets[role].password)
              }}>
                <SelectTrigger className='bg-red-500'>
                  <SelectValue placeholder="Select role..." />
                </SelectTrigger>
                <SelectContent className='bg-red-500'>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                  <SelectItem value="picker">Picker</SelectItem>
                </SelectContent>
              </Select>
            </FormItem> */}

            <Button className='mt-2' loading={isLoading}>
              Login
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
