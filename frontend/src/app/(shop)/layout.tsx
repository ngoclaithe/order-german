import { BottomNav } from "@/components/BottomNav";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full max-w-md bg-mesh min-h-screen relative shadow-[0_0_50px_rgba(255,255,255,0.05)] mx-auto overflow-hidden">
            {children}
            <BottomNav />
        </div>
    );
}
