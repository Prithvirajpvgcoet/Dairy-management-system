const { z } = require('zod');

const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required")
});

const signupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().min(10, "Phone must be at least 10 digits"),
    address: z.string().optional(),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.string().optional()
});

const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    unit: z.string().min(1, "Unit is required"),
    price_per_unit: z.union([z.number(), z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price")]),
    icon: z.string().optional(),
    in_stock: z.boolean().optional().default(true)
});

const deliveryStatusSchema = z.object({
    customerId: z.number().int().positive("Invalid customer ID"),
    delivered: z.boolean(),
    quantity: z.number().optional()
});

const collectPaymentSchema = z.object({
    customerId: z.union([z.number(), z.string().transform(val => parseInt(val, 10))]),
    amount: z.number().nonnegative("Amount must be non-negative"),
    method: z.enum(['CASH', 'UPI', 'CARD'])
});

const customerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(10, "Phone must be at least 10 digits"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    address: z.string().min(5, "Address is required"),
    default_quantity: z.number().optional(),
    price_per_liter: z.number().optional()
});

const deliveryBoySchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(10, "Phone is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    salary_type: z.enum(['FIXED', 'PER_LITER', 'FIXED_PLUS_INCENTIVE']),
    salary_rate: z.union([z.number(), z.string().transform(val => parseFloat(val))])
});

const assignRouteSchema = z.object({
    customerId: z.number().int().positive(),
    deliveryBoyId: z.number().int().positive().nullable()
});

const requirementsSchema = z.object({
    requirements: z.record(z.string(), z.number().nonnegative())
});

const checkoutOnetimeSchema = z.object({
    items: z.array(z.object({
        product_id: z.number().int().positive(),
        quantity: z.number().positive(),
        price_per_unit: z.number().nonnegative()
    })).min(1, "Cart cannot be empty")
});

module.exports = {
    loginSchema,
    signupSchema,
    productSchema,
    deliveryStatusSchema,
    collectPaymentSchema,
    customerSchema,
    deliveryBoySchema,
    assignRouteSchema,
    requirementsSchema,
    checkoutOnetimeSchema
};
