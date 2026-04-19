import { X } from 'lucide-react';
import { CANCEL_REASONS } from '@/lib/constants';

interface Props {
    cancelDialog: { orderId: string } | null;
    cancelNote: string;
    setCancelNote: (val: string) => void;
    onClose: () => void;
    onConfirm: () => void;
}

export function CancelModal({ cancelDialog, cancelNote, setCancelNote, onClose, onConfirm }: Props) {
    if (!cancelDialog) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-rose-600">Cancel Order</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <div className="space-y-2">
                    {CANCEL_REASONS.map(r => (
                        <button key={r} onClick={() => setCancelNote(r)} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm border transition-colors ${cancelNote === r ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>{r}</button>
                    ))}
                </div>
                <textarea value={cancelNote} onChange={e => setCancelNote(e.target.value)} placeholder="Or type custom reason..." className="w-full h-14 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-gray-900 text-sm focus:outline-none resize-none" />
                <button onClick={onConfirm} disabled={!cancelNote} className="w-full h-10 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 font-bold rounded-xl text-white text-sm">Confirm Cancellation</button>
            </div>
        </div>
    );
}
