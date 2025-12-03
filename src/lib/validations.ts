import { z } from 'zod';

// Auth schemas
export const signInSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(1, 'Please enter your full name').max(100, 'Name must be less than 100 characters'),
});

// Listing schema
export const listingSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(5000, 'Description must be less than 5000 characters').optional().or(z.literal('')),
  price: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0 && num <= 100000;
  }, 'Price must be between 1 and 100,000'),
  location: z.string().trim().min(1, 'Location is required').max(200),
  address: z.string().max(300).optional().or(z.literal('')),
  room_type: z.enum(['single', 'shared', 'studio', 'entire_apartment']),
  available_from: z.string().min(1, 'Available from date is required'),
  available_until: z.string().optional().or(z.literal('')),
  amenities: z.array(z.string()),
  house_rules: z.string().max(2000).optional().or(z.literal('')),
  preferred_gender: z.enum(['any', 'male', 'female']),
  pets_allowed: z.boolean(),
  smoking_allowed: z.boolean(),
});

// Profile schema
export const profileSchema = z.object({
  full_name: z.string().trim().max(100, 'Name must be less than 100 characters').optional().or(z.literal('')),
  bio: z.string().max(1000, 'Bio must be less than 1000 characters').optional().or(z.literal('')),
  phone: z.string().max(20, 'Phone number is too long').optional().or(z.literal('')),
  whatsapp: z.string().max(20, 'WhatsApp number is too long').optional().or(z.literal('')),
  email_public: z.string().email('Please enter a valid email').max(255).optional().or(z.literal('')),
});

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ListingFormData = z.infer<typeof listingSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
