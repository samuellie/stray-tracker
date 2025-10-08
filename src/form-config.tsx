import { z } from 'zod'

// Animal form schemas
export const animalFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  species: z.enum(['dog', 'cat', 'bird', 'rabbit', 'other'], {
    errorMap: () => ({ message: 'Please select a valid species' }),
  }),
  breed: z
    .string()
    .max(50, 'Breed name must be less than 50 characters')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  color: z
    .string()
    .min(1, 'Color is required')
    .max(100, 'Color description must be less than 100 characters'),
  age: z
    .number()
    .min(0, 'Age cannot be negative')
    .max(100, 'Age must be less than 100'),
  size: z.enum(['small', 'medium', 'large', 'extra-large'], {
    errorMap: () => ({ message: 'Please select a valid size' }),
  }),
  health: z
    .string()
    .max(300, 'Health notes must be less than 300 characters')
    .optional(),
  location: z
    .string()
    .min(1, 'Location is required')
    .max(200, 'Location must be less than 200 characters'),
  latitude: z
    .number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude')
    .optional(),
  longitude: z
    .number()
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude')
    .optional(),
})

export type AnimalFormData = z.infer<typeof animalFormSchema> & {
  images: File[]
}

// Sighting form schema
export const sightingFormSchema = z
  .object({
    strayId: z.number().optional(),
    species: z.enum(['cat', 'dog', 'other']).optional(),
    animalSize: z.enum(['small', 'medium', 'large']).optional(),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(1000, 'Description must be less than 1000 characters'),
    location: z
      .string()
      .min(1, 'Location is required')
      .max(200, 'Location must be less than 200 characters'),
    latitude: z
      .number()
      .min(-90, 'Invalid latitude')
      .max(90, 'Invalid latitude'),
    longitude: z
      .number()
      .min(-180, 'Invalid longitude')
      .max(180, 'Invalid longitude'),
    date: z.string().refine(value => {
      const date = new Date(value)
      return !isNaN(date.getTime()) && date <= new Date()
    }, 'Date cannot be in the future'),
    weatherCondition: z
      .string()
      .max(50, 'Weather condition must be less than 50 characters')
      .optional(),
    confidence: z
      .number()
      .min(1, 'Confidence must be at least 1')
      .max(10, 'Confidence must be at most 10')
      .optional(),
    notes: z
      .string()
      .max(1000, 'Notes must be less than 1000 characters')
      .optional(),
  })
  .refine(
    data => {
      // If strayId is not provided, species and animalSize are required
      if (!data.strayId) {
        return data.species && data.animalSize
      }
      return true
    },
    {
      message:
        'Species and size are required when reporting a new animal not in the system',
      path: ['species'], // This will show the error on the species field
    }
  )

export type SightingFormData = z.infer<typeof sightingFormSchema> & {
  images: File[]
}

// Authentication form schemas
export const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const signupFormSchema = loginFormSchema
  .extend({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters'),
    email: z.string().email(),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    // .regex(
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    //   'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    // ),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type SignupFormData = z.infer<typeof signupFormSchema>
export type LoginFormData = z.infer<typeof loginFormSchema>

// Validation helpers
export const validateAnimalForm = (data: Partial<AnimalFormData>) => {
  return animalFormSchema.safeParse(data)
}

export const validateSightingForm = (data: Partial<SightingFormData>) => {
  return sightingFormSchema.safeParse(data)
}

export const validateLoginForm = (data: Partial<LoginFormData>) => {
  return loginFormSchema.safeParse(data)
}

export const validateSignupForm = (data: Partial<SignupFormData>) => {
  return signupFormSchema.safeParse(data)
}

// Form field error display component
export const FieldError = ({ error }: { error?: string }) => {
  if (!error) return null
  return <em className="text-red-600 text-sm">{error}</em>
}

// Default values
export const animalFormDefaults: Partial<AnimalFormData> = {
  name: '',
  species: undefined,
  breed: '',
  description: '',
  color: '',
  age: 0,
  size: 'medium',
  health: '',
  location: '',
  images: [],
}

export const sightingFormDefaults: Partial<SightingFormData> = {
  strayId: undefined,
  species: 'cat',
  animalSize: 'small',
  description: '',
  location: '',
  latitude: 3.1072086999999984,
  longitude: 101.67908995767199,
  date: new Date().toISOString().split('T')[0],
  weatherCondition: undefined,
  confidence: undefined,
  notes: '',
  images: [],
}

export const signupFormDefaults: Partial<SignupFormData> = {
  name: 'samuel',
  email: 'user@email.com',
  password: 'password',
  confirmPassword: 'password',
}

export const loginFormDefaults: LoginFormData = {
  email: 'user@email.com',
  password: 'password',
}
