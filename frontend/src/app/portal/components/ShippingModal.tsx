import { X } from 'lucide-react';

interface Props {
    shippingDialog: { orderId: string; current: number } | null;
    shippingFee: number;
    setShippingFee: (val: number) => void;
    onClose: () => void;
    onSave: (fee: number) => void;
}

export function ShippingModal({ shippingDialog, shippingFee, setShippingFee, onClose, onSave }: Props) {
    if (!shippingDialog) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-cyan-700">Set Shipping Fee</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <input type="text" inputMode="decimal" value={shippingFee} onChange={e => setShippingFee(parseFloat(e.target.value.replace(',', '.')) || 0)} placeholder="0.00" className="w-full h-10 bg-gray-50 border border-gray-200 rounded-xl px-4 text-gray-900 text-sm focus:outline-none" />
                <button onClick={() => onSave(shippingFee)} className="w-full h-10 bg-cyan-600 hover:bg-cyan-500 font-bold rounded-xl text-white text-sm">Save</button>
            </div>
        </div>
    );
}
