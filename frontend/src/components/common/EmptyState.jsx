import React from 'react';
import { PackageOpen } from 'lucide-react';

export default function EmptyState({
    icon: Icon = PackageOpen,
    title = 'No records found',
    description = 'There are no items to display right now.',
    actionText,
    onAction
}) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="p-4 rounded-full bg-slate-50 text-slate-400 mb-3">
                <Icon className="w-8 h-8 stroke-1" />
            </div>
            <h4 className="text-base font-bold text-slate-800">{title}</h4>
            <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>
            {actionText && onAction && (
                <button
                    onClick={onAction}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                >
                    {actionText}
                </button>
            )}
        </div>
    );
}
