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
    customerId: z.coerce.number().int().positive("Invalid customer ID"),
    status: z.enum(['DELIVERED', 'NOT_DELIVERED', 'CUSTOMER_SKIPPED', 'DELIVERY_FAILED', 'OTHER_EXCEPTION']).optional(),
    delivered: z.boolean().optional(),
    actual_quantity: z.coerce.number().min(0).max(100).optional(),
    quantity: z.coerce.number().min(0).max(100).optional(),
    gps_latitude: z.coerce.number().min(-90).max(90).nullish(),
    gps_longitude: z.coerce.number().min(-180).max(180).nullish(),
    gps_lat: z.coerce.number().min(-90).max(90).nullish(),
    gps_lng: z.coerce.number().min(-180).max(180).nullish(),
    exception_reason: z.string().max(300).optional()
}).transform(data => {
    const status = data.status || (data.delivered ? 'DELIVERED' : 'NOT_DELIVERED');
    const delivered = status === 'DELIVERED';
    const actual_quantity = data.actual_quantity !== undefined ? data.actual_quantity : (data.quantity !== undefined ? data.quantity : 0);
    const lat = data.gps_latitude !== undefined ? data.gps_latitude : data.gps_lat;
    const lng = data.gps_longitude !== undefined ? data.gps_longitude : data.gps_lng;
    return {
        ...data,
        status,
        delivered,
        actual_quantity,
        quantity: actual_quantity,
        gps_latitude: lat,
        gps_longitude: lng,
        gps_lat: lat,
        gps_lng: lng
    };
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

const recordPaymentSchema = z.object({
    amount: z.coerce.number().positive("Amount must be greater than 0"),
    method: z.enum(['CASH', 'UPI', 'CARD', 'WALLET', 'ONLINE']).default('CASH'),
    reference: z.string().max(100).optional()
});

const verifyPaymentSchema = z.object({
    razorpay_order_id: z.string().min(1),
    razorpay_payment_id: z.string().min(1),
    razorpay_signature: z.string().min(1),
    bill_id: z.coerce.number().int().positive().optional(),
    amount: z.coerce.number().positive().optional()
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
    checkoutOnetimeSchema,
    recordPaymentSchema,
    verifyPaymentSchema
};
