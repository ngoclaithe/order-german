export const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
    PENDING: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'Pending' },
    CONFIRMED: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', label: 'Confirmed' },
    PREPARING: { color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200', label: 'Preparing' },
    DELIVERING: { color: 'text-cyan-700', bg: 'bg-cyan-50 border-cyan-200', label: 'Delivering' },
    COMPLETED: { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Completed' },
    CANCELLED: { color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', label: 'Cancelled' },
};

export const STATUS_MESSAGES: Record<string, string> = {
    CONFIRMED: 'Your order has been confirmed!',
    PREPARING: 'Your food is being prepared.',
    DELIVERING: 'Your order is on the way!',
    COMPLETED: 'Your order has been delivered. Thank you!',
    CANCELLED: 'Your order has been cancelled.',
};

export const CANCEL_REASONS = [
    'Location is too far for delivery',
    'Item is currently out of stock',
    'Restaurant is closed / busy',
    'Customer requested cancellation',
    'Other (custom note)',
];
