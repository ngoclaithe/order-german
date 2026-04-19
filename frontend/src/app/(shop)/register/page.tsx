'use client';

import { KeyRound, Mail, MapPin, Phone, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useState, useEffect } from 'react';
import { AuthService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { useLangStore } from '@/store/lang.store';

export default function RegisterPage() {
    const { login } = useAuthStore();
    const router = useRouter();
    const { t } = useLangStore();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        phone: '',
        address: '',
        whatsapp: '',
        telegram: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [toastMsg, setToastMsg] = useState<{ title: string, desc?: string, type: 'error' | 'success' } | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setToastMsg(null);
        try {
            const data = await AuthService.register(formData);
            login(data);
            router.push('/profile'); // Send to profile on success
        } catch (err: any) {
            setToastMsg({ title: t('Registration failed', 'Registrierung fehlgeschlagen'), desc: err.response?.data?.message || 'Registration failed', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!mounted) return <main className="min-h-screen bg-[#0f0f0f]" />;

    return (
        <main className="min-h-screen pb-32 text-white relative flex flex-col justify-center px-6 isolate">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px] -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -z-10" />

            {/* Toast Notification */}
            {toastMsg && (
                <div className="absolute top-10 left-6 right-6 z-50 animate-in slide-in-from-top-2">
                    <div className={`p-4 rounded-2xl border backdrop-blur-md shadow-2xl flex items-start gap-4 ${toastMsg.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'}`}>
                        <div>
                            <h3 className="font-bold">{toastMsg.title}</h3>
                            {toastMsg.desc && <p className="text-sm opacity-80 mt-1">{toastMsg.desc}</p>}
                        </div>
                    </div>
                </div>
            )}

            <div className="glass-dark p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300 mt-10">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 blur-2xl rounded-full" />

                <h1 className="text-3xl font-extrabold mb-2">{t('Create Account', 'Konto erstellen')}</h1>
                <p className="text-white/50 mb-6">{t('Join ordering platform for fast food delivery.', 'Tritt der Bestellplattform für die Lieferung bei.')}</p>

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-white/80">{t('Email', 'E-Mail')} <span className="text-rose-400">*</span></label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl h-12 pl-12 pr-4 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-white/80">{t('Password', 'Passwort')} <span className="text-rose-400">*</span></label>
                        <div className="relative">
                            <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl h-12 pl-12 pr-4 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                                placeholder="••••••••"
                                minLength={4}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-white/80">{t('Phone Number', 'Telefonnummer')} <span className="text-rose-400">*</span></label>
                        <div className="relative">
                            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                            <input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl h-12 pl-12 pr-4 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                                placeholder="+49 123 4567"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-white/80">{t('Delivery Address', 'Lieferadresse')} <span className="text-rose-400">*</span></label>
                        <div className="relative">
                            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                            <input
                                type="text"
                                required
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl h-12 pl-12 pr-4 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                                placeholder="Berlin, Germany"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white/80">WhatsApp</label>
                            <div className="relative">
                                <MessageCircle size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400/50" />
                                <input
                                    type="text"
                                    value={formData.whatsapp}
                                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl h-12 pl-9 pr-3 text-sm focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                                    placeholder={t('Optional', 'Optional')}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white/80">Telegram</label>
                            <div className="relative">
                                <MessageCircle size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/50" />
                                <input
                                    type="text"
                                    value={formData.telegram}
                                    onChange={e => setFormData({ ...formData, telegram: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl h-12 pl-9 pr-3 text-sm focus:ring-2 focus:ring-cyan-400 outline-none transition-all"
                                    placeholder={t('Optional', 'Optional')}
                                />
                            </div>
                        </div>
                    </div>

                    <button disabled={isLoading} className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-bold mt-6 shadow-[0_0_20px_rgba(52,211,153,0.3)] disabled:opacity-50 active:scale-95 transition-all">
                        {isLoading ? t('Creating Account...', 'Konto wird erstellt...') : t('Register', 'Registrieren')}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-white/50">
                    {t('Already have an account?', 'Haben Sie bereits ein Konto?')} {' '}
                    <Link href="/profile" className="text-emerald-400 font-bold hover:underline">
                        {t('Sign In', 'Anmelden')}
                    </Link>
                </div>
            </div>
        </main>
    );
}
