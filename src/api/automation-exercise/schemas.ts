import { z } from 'zod';

/**
 * Response schemas for the Automation Exercise API.
 *
 * One schema gives us BOTH:
 *  - runtime validation   → expectSchema(ProductsListSchema, result.body)
 *  - the TypeScript type  → type ProductsList = z.infer<typeof ProductsListSchema>
 *
 * z.object() ignores unknown extra fields (adding fields is not a breaking change),
 * but missing fields, wrong types and wrong formats fail with the exact path that broke.
 */

/** Generic message response: errors, "User created!", "Account deleted!", ... */
export const ApiMessageSchema = z.object({
  responseCode: z.number().int(),
  message: z.string().min(1),
});

/** Body of a REAL HTTP 405 produced by the server framework (e.g. PATCH, GET on createAccount). */
export const FrameworkErrorSchema = z.object({
  detail: z.string().min(1),
});

export const ProductSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  price: z.string().regex(/^Rs\. \d+$/, 'price must look like "Rs. 500"'),
  brand: z.string().min(1),
  category: z.object({
    usertype: z.object({ usertype: z.string().min(1) }),
    category: z.string().min(1),
  }),
});

export const ProductsListSchema = z.object({
  responseCode: z.literal(200),
  products: z.array(ProductSchema),
});

export const BrandSchema = z.object({
  id: z.number().int().positive(),
  brand: z.string().min(1),
});

export const BrandsListSchema = z.object({
  responseCode: z.literal(200),
  brands: z.array(BrandSchema),
});

/**
 * getUserDetailByEmail success body.
 * The public docs only say "User Detail"; these field names were confirmed against the live API.
 * NOTE the naming differs from createAccount: birth_day (not birth_date), first_name (not firstname),
 * last_name (not lastname), and there is no mobile_number or password in the response.
 *
 * `email` is a plain string, NOT z.email(): the server doesn't validate emails at sign-up, so real
 * accounts exist with values like "not-an-email" or "" (see get-user-detail.api.spec.ts).
 */
export const UserDetailSchema = z.object({
  responseCode: z.literal(200),
  user: z.object({
    id: z.number().int().positive(),
    name: z.string(),
    email: z.string(),
    title: z.string(),
    birth_day: z.string(),
    birth_month: z.string(),
    birth_year: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    company: z.string(),
    address1: z.string(),
    address2: z.string(),
    country: z.string(),
    state: z.string(),
    city: z.string(),
    zipcode: z.string(),
  }),
});

export type ApiMessage = z.infer<typeof ApiMessageSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type ProductsList = z.infer<typeof ProductsListSchema>;
export type Brand = z.infer<typeof BrandSchema>;
export type BrandsList = z.infer<typeof BrandsListSchema>;
export type UserDetail = z.infer<typeof UserDetailSchema>;
