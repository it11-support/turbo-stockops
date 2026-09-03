import { z } from 'zod'

const userRoleSchema = z.object({
  id: z.number(),
  role: z.union([
    z.literal('superadmin'),
    z.literal('admin'),
    z.literal('picker'),
  ]),
  description: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  permissions: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      description: z.string(),
    })
  ),
})

// schema User dari backend
const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string(),
  email: z.string(),
  role: userRoleSchema, // object role
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type User = z.infer<typeof userSchema>
export type Role = z.infer<typeof userRoleSchema>

// ⚡ schema khusus untuk form
export const userFormSchema = z
  .object({
    name: z.string().min(1, { message: 'Name is required.' }),
    username: z.string().min(1, { message: 'Username is required.' }),
    email: z.string().email({ message: 'Email is invalid.' }),
    role_id: z.number(),
    password: z.string().optional(),
    password_confirmation: z.string().optional(),
    isEdit: z.boolean(),
  })
  .superRefine(({ isEdit, password, password_confirmation }, ctx) => {
    if (!isEdit || (isEdit && password)) {
      if (!password || password.length < 8) {
        ctx.addIssue({
          code: 'custom',
          message: 'Password must be at least 8 characters long.',
          path: ['password'],
        })
      }
      if (password && password !== password_confirmation) {
        ctx.addIssue({
          code: 'custom',
          message: "Passwords don't match.",
          path: ['confirmPassword'],
        })
      }
    }
  })

export type UserForm = z.infer<typeof userFormSchema>

// daftar user
export const userListSchema = z.array(userSchema)
