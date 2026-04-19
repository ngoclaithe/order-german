'use client';

import { MenuItem, ToppingOption } from '@/services/menu.service';
import { useCartStore } from '@/store/cart.store';
import { useState, useId } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { useLangStore } from '@/store/lang.store';

interface Props {
    item: MenuItem | null;
    onClose: () => void;
}

export function ToppingModal({ item, onClose }: Props) {
    const [quantity, setQuantity] = useState(1);
    const [note, setNote] = useState('');
    const [selectedToppings, setSelectedToppings] = useState<Record<string, ToppingOption[]>>({});
    const addItem = useCartStore((state) => state.addItem);
    const { t } = useLangStore();

    if (!item) return null;

    const handleToggleTopping = (group: any, option: ToppingOption) => {
        setSelectedToppings(prev => {
            const groupSelections = prev[group.id] || [];
            const isSelected = groupSelections.some(opt => opt.id === option.id);

            if (isSelected) {
                // Remove if multiple selection is allowed or if it's the only one
                if (group.multipleSelection || !group.requiresSelection) {
                    return { ...prev, [group.id]: groupSelections.filter(opt => opt.id !== option.id) };
                }
                return prev; // Required single selection cannot be unselected unless picking another
            } else {
                if (!group.multipleSelection) {
                    // Replace selection
                    return { ...prev, [group.id]: [option] };
                }
                // Add multi selection
                return { ...prev, [group.id]: [...groupSelections, option] };
            }
        });
    };

    // Check required groups
    const isValid = item.toppingGroups.every(g => {
        if (g.requiresSelection) {
            return selectedToppings[g.id] && selectedToppings[g.id].length > 0;
        }
        return true;
    });

    const allSelectedOptions = Object.values(selectedToppings).flat();
    const toppingsPrice = allSelectedOptions.reduce((acc, curr) => acc + curr.price, 0);
    const totalItemPrice = item.price + toppingsPrice;

    const handleAddToCart = () => {
        if (!isValid) return;

        const flatSelectedToppings = Object.values(selectedToppings).flat();

        addItem({
            cartItemId: crypto.randomUUID(), // Dynamic ID per addition
            menuItem: item,
            quantity,
            selectedToppings: flatSelectedToppings,
            totalItemPrice,
            note: note.trim() || undefined
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="w-full max-w-md max-h-[90vh] bg-black glass rounded-t-3xl border border-white/10 flex flex-col relative animate-in slide-in-from-bottom"
                onClick={e => e.stopPropagation()}
            >
                {/* Hero Image */}
                <div className="relative w-full h-48 bg-black/50 overflow-hidden rounded-t-3xl shrink-0">
                    {item.imageUrl ? (
                        <img
                            src={item.imageUrl.startsWith('http') ? item.imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${item.imageUrl}`}
                            alt={item.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-7xl bg-gradient-to-b from-white/5 to-transparent">🍔</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    <button onClick={onClose} className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 active:scale-95 text-white z-10">
                        <X size={20} />
                    </button>
                    <div className="absolute bottom-3 left-4 right-4">
                        <h2 className="text-2xl font-bold text-white drop-shadow-lg">{item.name}</h2>
                        <div className="flex items-center justify-between mt-1">
                            <span className="font-mono font-bold text-emerald-300 text-lg">€{item.price.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 no-scrollbar">
                    {item.description && (
                        <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
                    )}

                    {item.toppingGroups.map(group => (
                        <div key={group.id} className="space-y-3 glass-dark p-4 rounded-3xl border border-white/5">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg text-white">{group.name}</h3>
                                {group.requiresSelection && (
                                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-rose-500/20 text-rose-300 rounded-full">
                                        Required
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2">
                                {group.options.map(option => {
                                    const isSelected = selectedToppings[group.id]?.some(opt => opt.id === option.id);
                                    return (
                                        <label
                                            key={option.id}
                                            className={`flex justify-between items-center p-3 rounded-2xl border transition-all cursor-pointer ${isSelected ? 'border-emerald-400 bg-emerald-400/10' : 'border-white/10 hover:border-white/30'}`}
                                        >
                                            <div className="flex items-center gap-3 text-white">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-emerald-400 bg-emerald-400' : 'border-white/40'}`}>
                                                    {isSelected && <div className="w-2 h-2 rounded-full bg-black" />}
                                                </div>
                                                <span className="font-medium">{option.name}</span>
                                            </div>
                                            <div className="text-emerald-300 font-mono font-medium">
                                                {option.price > 0 ? `+€${option.price.toFixed(2)}` : 'Free'}
                                            </div>
                                            {/* Hidden native input for accessibility */}
                                            <input
                                                type={group.multipleSelection ? "checkbox" : "radio"}
                                                name={group.id}
                                                className="hidden"
                                                checked={isSelected || false}
                                                onChange={() => handleToggleTopping(group, option)}
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Note Section */}
                    <div className="space-y-2 pt-4">
                        <h3 className="font-bold text-white pl-2">{t('Special Instructions', 'Besondere Anweisungen')}</h3>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder={t('E.g. No onions, extra spicy...', 'Z.B. ohne Zwiebeln, extra scharf...')}
                            rows={2}
                            className="w-full glass-dark bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 resize-none transition-all"
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 glass bg-black/60 backdrop-blur-3xl rounded-t-3xl">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-2xl border border-white/5">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="text-white hover:text-rose-300 transition-colors"
                            >
                                <Minus size={20} />
                            </button>
                            <span className="w-6 text-center font-bold text-lg text-white">{quantity}</span>
                            <button
                                onClick={() => setQuantity(q => q + 1)}
                                className="text-white hover:text-emerald-300 transition-colors"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            disabled={!isValid}
                            className={`flex-1 py-4 rounded-2xl font-bold flex justify-between px-6 transition-all shadow-lg text-black
                ${isValid ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 active:scale-[0.98]' : 'bg-gray-500 opacity-50 cursor-not-allowed'}`}
                        >
                            <span>{t('Add to Cart', 'Hinzufügen')}</span>
                            <span className="font-mono">€{(totalItemPrice * quantity).toFixed(2)}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
