import { createBrowserRouter } from 'react-router-dom'
import GeneralError from './pages/errors/general-error'
import NotFoundError from './pages/errors/not-found-error'
import MaintenanceError from './pages/errors/maintenance-error'
import UnauthorisedError from './pages/errors/unauthorised-error.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import AppShell from './components/app-shell.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        errorElement: <GeneralError />,
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import('./pages/dashboard/overview')).default,
            }),
          },
          {
            path: 'kanban',
            lazy: async () => ({
              Component: (await import('@/pages/kanban')).default,
            }),
          },
          {
            path: 'product',
            lazy: async () => ({
              Component: (await import('./pages/product')).default,
            }),
            children: [
              {
                index: true,
                lazy: async () => ({
                  Component: (await import('./pages/product/list')).default,
                }),
              },
              {
                path: 'add-product',
                lazy: async () => ({
                  Component: (await import('./pages/product/add')).default,
                }),
              },
            ],
          },
          {
            path: 'dashboard',
            lazy: async () => ({
              Component: (await import('@/pages/dashboard')).default,
            }),
          },
          {
            path: 'chats',
            lazy: async () => ({
              Component: (await import('@/pages/chats')).default,
            }),
          },

          // Role-based proteksi
          {
            element: <ProtectedRoute requiredRoles={['superadmin', 'admin']} />,
            children: [
              {
                path: 'order',
                lazy: async () => ({
                  Component: (await import('@/pages/orders')).default,
                }),
              },
              {
                path: 'order/:id/process',
                lazy: async () => ({
                  Component: (await import('@/pages/process-so')).default,
                }),
              },
            ],
          },

          {
            path: 'emails',
            children: [
              {
                index: true,
                lazy: async () => ({
                  Component: (await import('@/pages/email/list')).default,
                }),
              },
              {
                path: 'send',
                lazy: async () => ({
                  Component: (await import('@/pages/email/send')).default,
                }),
              },
            ],
          },
          {
            path: 'pick-list',
            children: [
              {
                index: true,
                lazy: async () => ({
                  Component: (await import('@/pages/pick-list')).default,
                }),
              },
              {
                path: ':id/details',
                lazy: async () => ({
                  Component: (await import('@/pages/pick-list/details'))
                    .default,
                }),
              },
              {
                path: ':id/process',
                lazy: async () => ({
                  Component: (await import('@/pages/pick-list/process'))
                    .default,
                }),
              },
              {
                path: 'confirm',
                lazy: async () => ({
                  Component: (await import('@/pages/pick-list/confirm'))
                    .default,
                }),
              },
            ],
          },
          {
            path: 'supports',
            lazy: async () => ({
              Component: (await import('@/pages/support')).default,
            }),
          },

          {
            element: <ProtectedRoute requiredRoles={['superadmin', 'admin']} />,
            children: [
              {
                path: 'users',
                lazy: async () => ({
                  Component: (await import('@/pages/user-list')).default,
                }),
              },
            ],
          },

          {
            element: <ProtectedRoute requiredRoles={['superadmin']} />,
            children: [
              {
                path: 'settings',
                lazy: async () => ({
                  Component: (await import('./pages/settings')).default,
                }),
                errorElement: <GeneralError />,
                children: [
                  {
                    index: true,
                    lazy: async () => ({
                      Component: (await import('./pages/settings/profile'))
                        .default,
                    }),
                  },
                  {
                    path: 'account',
                    lazy: async () => ({
                      Component: (await import('./pages/settings/account'))
                        .default,
                    }),
                  },
                  {
                    path: 'appearance',
                    lazy: async () => ({
                      Component: (await import('./pages/settings/appearance'))
                        .default,
                    }),
                  },
                  {
                    path: 'notifications',
                    lazy: async () => ({
                      Component: (
                        await import('./pages/settings/notifications')
                      ).default,
                    }),
                  },
                  {
                    path: 'display',
                    lazy: async () => ({
                      Component: (await import('./pages/settings/display'))
                        .default,
                    }),
                  },
                  {
                    path: 'error-example',
                    lazy: async () => ({
                      Component: (
                        await import('./pages/settings/error-example')
                      ).default,
                    }),
                    errorElement: (
                      <GeneralError className='h-[50svh]' minimal />
                    ),
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  // Auth routes di luar ProtectedRoute
  {
    path: '/sign-in',
    lazy: async () => ({
      Component: (await import('./pages/auth/sign-in')).default,
    }),
  },
  {
    path: '/login',
    lazy: async () => ({
      Component: (await import('./pages/auth/sign-in-2')).default,
    }),
  },
  {
    path: '/sign-up',
    lazy: async () => ({
      Component: (await import('./pages/auth/sign-up')).default,
    }),
  },
  {
    path: '/forgot-password',
    lazy: async () => ({
      Component: (await import('./pages/auth/forgot-password')).default,
    }),
  },
  {
    path: '/otp',
    lazy: async () => ({
      Component: (await import('./pages/auth/otp')).default,
    }),
  },

  { path: '/500', Component: GeneralError },
  { path: '/404', Component: NotFoundError },
  { path: '/503', Component: MaintenanceError },
  { path: '/401', Component: UnauthorisedError },

  { path: '*', Component: NotFoundError },
])

export default router
