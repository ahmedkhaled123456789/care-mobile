import { z } from 'zod';
import { t } from '../i18n';

/**
 * Zod schemas mirroring the backend's express-validator rules (and the web app's
 * client checks). Built as functions so messages follow the current locale.
 */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Backend accepts UAE, Egyptian or Saudi mobile numbers (isMobilePhone ar-AE / ar-EG / ar-SA). */
export const PHONE_RE = /^(\+?971|0)?5[024568]\d{7}$|^(\+?20|0)?1[0125]\d{8}$|^(\+?966|0)?5\d{8}$/;
export const cleanPhone = (v: string) => v.replace(/[\s-]/g, '');

const required = () => z.string().trim().min(1, t('Common.required'));
const email = () => z.string().trim().regex(EMAIL_RE, t('Auth.emailInvalid'));
const password = () => z.string().min(6, t('Auth.passwordMin'));
const phone = () => z.string().trim().refine((v) => PHONE_RE.test(cleanPhone(v)), t('Auth.phoneInvalid'));
const optionalPhone = () => z.string().trim().refine((v) => !v || PHONE_RE.test(cleanPhone(v)), t('Auth.phoneInvalid'));
const nameLength = (min: number, max: number) =>
  z.string().trim().min(min, t('Dash.common.nameLength', { min, max })).max(max, t('Dash.common.nameLength', { min, max }));
const optionalMax = (max: number) => z.string().trim().max(max);

const matching = <T extends z.ZodRawShape>(shape: T, a: keyof T & string, b: keyof T & string) =>
  z.object(shape).refine((v) => (v as Record<string, unknown>)[a] === (v as Record<string, unknown>)[b], { message: t('Auth.passwordMatch'), path: [b] });

/* ---------------------------------- Auth --------------------------------- */
export const loginSchema = () => z.object({ email: email(), password: z.string().min(1, t('Auth.passwordMin')) });
export const signupSchema = () =>
  matching({ name: z.string().trim().min(3, t('Auth.nameMin')), email: email(), password: password(), passwordConfirm: z.string() }, 'password', 'passwordConfirm');
export const forgotEmailSchema = () => z.object({ email: email() });
export const resetCodeSchema = () => z.object({ code: z.string().regex(/^\d{6}$/, t('Auth.codeInvalid')) });
export const newPasswordSchema = () => matching({ password: password(), confirm: z.string() }, 'password', 'confirm');

/* -------------------------------- Account -------------------------------- */
export const profileSchema = () => z.object({ name: z.string().trim().min(3, t('Auth.nameMin')), email: email(), phone: optionalPhone() });
export const addressSchema = () =>
  z.object({ alias: optionalMax(40), details: required(), city: required(), postalCode: optionalMax(20), phone: required().pipe(phone()) });
export const reviewSchema = () =>
  z.object({ ratings: z.number().int().min(1, t('Reviews.ratingRequired')).max(5, t('Reviews.ratingRequired')), title: optionalMax(500) });

/* --------------------------------- Staff --------------------------------- */
export const namedImageSchema = () => z.object({ name: nameLength(3, 32), nameAr: optionalMax(32) });
export const subcategorySchema = () => z.object({ name: nameLength(2, 32), nameAr: optionalMax(32), category: z.string().min(1, t('Dash.common.chooseCategory')) });

export const couponSchema = (isNew: boolean) =>
  z.object({
    name: z.string().trim().regex(/^[A-Za-z0-9_-]{3,32}$/, t('Dash.coupons.errCode')),
    expire: z
      .date({ error: t('Dash.coupons.errExpire') })
      .refine((d) => !isNew || d.getTime() >= new Date().setHours(0, 0, 0, 0), t('Dash.coupons.errExpireFuture')),
    discount: z.string().refine((v) => Number(v) > 0 && Number(v) <= 100, t('Dash.coupons.errDiscount'))
  });

const coordinate = (limit: number, message: string) =>
  z.string().refine((v) => v.trim() !== '' && Number.isFinite(Number(v)) && Math.abs(Number(v)) <= limit, message);
export const branchSchema = () =>
  z.object({
    name: z.string().trim().min(1, t('Dash.branches.errName')).max(60),
    nameAr: optionalMax(60),
    city: z.string().trim().min(1, t('Dash.branches.errCity')),
    cityAr: z.string().trim(),
    address: z.string().trim().min(1, t('Dash.branches.errAddress')),
    addressAr: z.string().trim(),
    phone: z.string().trim().refine((v) => !v || (v.length >= 5 && v.length <= 20), t('Auth.phoneInvalid')),
    workingHours: z.string().trim(),
    lat: coordinate(90, t('Dash.branches.errLat')),
    lng: coordinate(180, t('Dash.branches.errLng')),
    isMain: z.boolean(),
    active: z.boolean()
  });

export const userSchema = (isNew: boolean) =>
  z
    .object({
      name: z.string().trim().min(3, t('Dash.users.errName')),
      email: z.string().trim().regex(EMAIL_RE, t('Dash.users.errEmail')),
      phone: z.string().trim().refine((v) => !v || PHONE_RE.test(cleanPhone(v)), t('Dash.users.errPhone')),
      role: z.enum(['user', 'manager', 'admin']),
      password: z.string(),
      passwordConfirm: z.string()
    })
    .superRefine((v, ctx) => {
      if (!isNew) return;
      if (v.password.length < 6) ctx.addIssue({ code: 'custom', path: ['password'], message: t('Dash.users.errPassword') });
      if (v.passwordConfirm !== v.password) ctx.addIssue({ code: 'custom', path: ['passwordConfirm'], message: t('Dash.users.errMatch') });
    });

export const userPasswordSchema = () =>
  matching({ currentPassword: z.string().min(1, t('Dash.common.required')), password: z.string().min(6, t('Dash.users.errPassword')), passwordConfirm: z.string() }, 'password', 'passwordConfirm');

export const productSchema = () =>
  z
    .object({
      title: z.string().trim().min(3, t('Dash.productForm.errTitle')).max(100, t('Dash.productForm.errTitle')),
      titleAr: z.string().trim().max(100, t('Dash.productForm.errTitleAr')),
      description: z.string().trim().min(20, t('Dash.productForm.errDesc')).max(2000, t('Dash.productForm.errDesc')),
      descriptionAr: z.string().trim().max(2000, t('Dash.productForm.errDesc')),
      quantity: z.string().refine((v) => v.trim() !== '' && Number.isInteger(Number(v)) && Number(v) >= 0, t('Dash.productForm.errQty')),
      price: z
        .string()
        .refine((v) => Number(v) > 0, t('Dash.productForm.errPrice'))
        .refine((v) => Number(v) <= 200000, t('Dash.productForm.errPriceMax')),
      priceAfterDiscount: z.string().refine((v) => v.trim() === '' || Number(v) > 0, t('Dash.productForm.errSale')),
      category: z.string().min(1, t('Dash.productForm.errCategory')),
      brand: z.string(),
      benefits: z.string(),
      ingredients: z.string(),
      sizes: z.string(),
      directionsEn: z.string(),
      directionsAr: z.string()
    })
    .refine((v) => v.priceAfterDiscount.trim() === '' || Number(v.priceAfterDiscount) < Number(v.price), {
      message: t('Dash.productForm.errSaleLower'),
      path: ['priceAfterDiscount']
    });

export type LoginValues = z.infer<ReturnType<typeof loginSchema>>;
export type SignupValues = z.infer<ReturnType<typeof signupSchema>>;
export type ProfileValues = z.infer<ReturnType<typeof profileSchema>>;
export type AddressValues = z.infer<ReturnType<typeof addressSchema>>;
export type CouponValues = z.infer<ReturnType<typeof couponSchema>>;
export type BranchValues = z.infer<ReturnType<typeof branchSchema>>;
export type UserValues = z.infer<ReturnType<typeof userSchema>>;
export type ProductValues = z.infer<ReturnType<typeof productSchema>>;
