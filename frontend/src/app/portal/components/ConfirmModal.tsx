import { X } from 'lucide-react';

interface Props {
    confirmDialog: { orderId: string } | null;
    confirmShipFee: string;
    setConfirmShipFee: (val: string) => void;
    onClose: () => void;
    onConfirm: (fee: number) => void;
}

export function ConfirmModal({ confirmDialog, confirmShipFee, setConfirmShipFee, onClose, onConfirm }: Props) {
    if (!confirmDialog) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-blue-700">Confirm Order</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <p className="text-sm text-gray-500">Enter the shipping fee before confirming this order.</p>
                <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Shipping Fee (€) <span className="text-rose-500">*</span></label>
                    <input type="text" inputMode="decimal" value={confirmShipFee} onChange={e => setConfirmShipFee(e.target.value)}
                        placeholder="e.g. 2,50" className="w-full h-10 bg-gray-50 border border-gray-200 rounded-xl px-4 text-gray-900 text-sm focus:outline-none" />
                </div>
                <button onClick={() => {
                    const fee = parseFloat(confirmShipFee.replace(',', '.')) || 0;
                    if (fee <= 0) return alert('Shipping fee is required!');
                    onConfirm(fee);
                }} disabled={!confirmShipFee}
                    className="w-full h-10 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 font-bold rounded-xl text-white text-sm">
                    Confirm Order
                </button>
            </div>
        </div>
    );
}
