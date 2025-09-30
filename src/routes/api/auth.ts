import { signupFormSchema } from '~/form-config'
import { createAuth } from '../../lib/auth'
import { createServerFn } from '@tanstack/react-start'

export const signUp = createServerFn({ method: 'POST' })
  .inputValidator(signupFormSchema)
  .handler(async ({ data, context }) => {
    return createAuth(context.env).api.signUpEmail({ body: data })
  })
