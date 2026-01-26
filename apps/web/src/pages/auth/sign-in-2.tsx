import { Card } from '@/components/ui/card'
import { UserAuthForm } from './components/user-auth-form'
import { useAuthStore } from '@/stores/authStore'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SignIn2() {
  const token = useAuthStore((state) => state.user?.token)
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      navigate('/', { replace: true })
    }
  }, [token, navigate])

  return (
    <>
      <div className='container grid h-svh flex-col items-center justify-center bg-primary-foreground lg:max-w-none lg:px-0'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[480px] lg:p-8'>
          <div className='mb-4 flex items-center justify-center'>
            <div className='logo mr-2 h-8 w-8'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 256 256'
                className={`transition-all`}
              >
                <rect width='256' height='256' fill='none'></rect>
                <line
                  x1='220'
                  y1='180'
                  x2='180'
                  y2='220'
                  fill='none'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='16'
                ></line>
                <line
                  x1='210'
                  y1='110'
                  x2='110'
                  y2='210'
                  fill='none'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='16'
                ></line>
                <line
                  x1='200'
                  y1='40'
                  x2='40'
                  y2='200'
                  fill='none'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='16'
                ></line>
                <span className='sr-only'>Website Name</span>
              </svg>
            </div>
            <h1 className='text-xl font-medium'>
              {import.meta.env.VITE_SITE_NAME}
            </h1>
          </div>
          <Card className='p-6'>
            <div className='flex flex-col space-y-2 text-left'>
              <h1 className='text-2xl font-semibold tracking-tight'>Login</h1>
              <p className='text-sm text-muted-foreground'>
                Enter your email and password below <br />
                to log into your account
              </p>
            </div>
            <UserAuthForm />
          </Card>
        </div>
      </div>
    </>
  )
}
