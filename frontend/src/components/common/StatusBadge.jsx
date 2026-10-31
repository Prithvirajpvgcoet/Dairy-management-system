import React from 'react';

const STATUS_CONFIG = {
    DELIVERED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Delivered' },
    PAID: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Paid' },
    CONFIRMED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Confirmed' },
    APPROVED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Approved' },
    ACTIVE: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Active' },

    PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending' },
    DRAFT: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', label: 'Draft' },
    OPEN: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', label: 'Open' },

    FINAL: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', label: 'Final' },
    PARTIAL: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Partial' },

    NOT_DELIVERED: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Not Delivered' },
    DELIVERY_FAILED: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Failed' },
    MISSED: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Missed' },
    REJECTED: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Rejected' },
    CANCELLED: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Cancelled' },

    CUSTOMER_SKIPPED: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', label: 'Skipped' },
    SKIPPED: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', label: 'Skipped' },
    INACTIVE: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', label: 'Inactive' }
};

export default function StatusBadge({ status, className = '' }) {
    if (!status) return null;
    const normalized = String(status).toUpperCase();
    const config = STATUS_CONFIG[normalized] || {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        label: status
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}>
            {config.label}
        </span>
    );
}
