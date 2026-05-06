import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Lock, Navigation } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/redux/hooks';
import toast from 'react-hot-toast';

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * StickyCartBar
 * – On /menu  → "X items | ₹total ··· View Cart →"
 * – On /cart  → "Validate Location ··· ₹total"
 * Renders only when cart has items and location matches.
 * Uses createPortal so position:fixed is never broken by parent transforms.
 */
export default function StickyCartBar() {
    const { items, subtotal, total, itemCount, discount } = useCart();
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const restaurant = useAppSelector(s => s.menu.restaurant);

    const isMenu = location.pathname === '/menu';
    const isCart = location.pathname === '/cart';

    if (!items.length) return null;
    if (!isMenu && !isCart) return null;

    const bar = (
        <div
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 8000,
                background: 'linear-gradient(135deg, #0F7A49 0%, #16A34A 48%, #34D399 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 clamp(1rem, 4vw, 2rem)',
                height: 64,
                boxShadow: '0 -4px 24px rgba(22,163,74,0.4)',
                animation: 'slideUp 0.3s var(--ease-spring)',
            }}
        >
            {isMenu && (
                <>
                    {/* Left: items + price */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: 10,
                            background: 'rgba(255,255,255,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <ShoppingBag size={16} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.78rem', fontWeight: 600, opacity: 0.85, lineHeight: 1.1 }}>
                                {itemCount} item{itemCount !== 1 ? 's' : ''} added
                            </p>
                            <p style={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.2, fontFamily: 'Outfit, sans-serif' }}>
                                ₹{subtotal}
                            </p>
                        </div>
                    </div>

                    {/* Right: View Cart */}
                    <button
                        onClick={() => navigate('/cart')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            background: 'rgba(255,255,255,0.2)',
                            border: '1.5px solid rgba(255,255,255,0.35)',
                            borderRadius: 10,
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            padding: '0.45rem 0.95rem',
                            cursor: 'pointer',
                            backdropFilter: 'blur(4px)',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        View Cart <ArrowRight size={14} />
                    </button>
                </>
            )}

            {isCart && (
                <>
                    {/* Left: Validate location prompt */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Lock size={16} style={{ opacity: 0.8 }} />
                        <div>
                            <p style={{ fontSize: '0.7rem', opacity: 0.7, fontWeight: 500, lineHeight: 1 }}>Canteen Pickup</p>
                            <p style={{ fontSize: '0.9rem', fontWeight: 800, lineHeight: 1.3 }}>Validate Location</p>
                        </div>
                    </div>

                    {/* Right: Validate & proceed */}
                    <button
                        onClick={() => {
                            if (!navigator.geolocation) {
                                toast.error('Geolocation is not supported by your browser');
                                return;
                            }
                            const toastId = toast.loading('Validating location...');
                            navigator.geolocation.getCurrentPosition(
                                (pos) => {
                                    const { latitude, longitude } = pos.coords;
                                    const RESTAURANT = restaurant?.coordinates ?? { lat: 28.6139, lng: 77.209 };
                                    const dist = haversineKm(latitude, longitude, RESTAURANT.lat, RESTAURANT.lng);
                                    toast.dismiss(toastId);
                                    const bypassCheck = import.meta.env.VITE_BYPASS_LOCATION_CHECK === 'true';
                                    if (bypassCheck || dist <= 1) {
                                        navigate('/checkout');
                                    } else {
                                        toast.error(`You must be within 1km of the canteen to order. You are ${dist.toFixed(1)}km away.`);
                                    }
                                },
                                (err) => {
                                    toast.dismiss(toastId);
                                    toast.error('Location access denied. Please enable it to proceed.');
                                },
                                { enableHighAccuracy: true, timeout: 10000 }
                            );
                        }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: 'rgba(255,255,255,0.2)',
                            border: '1.5px solid rgba(255,255,255,0.35)',
                            borderRadius: 10,
                            color: 'white',
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            padding: '0.5rem 1.1rem',
                            cursor: 'pointer',
                            backdropFilter: 'blur(4px)',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        ₹{total} <Navigation size={15} />
                    </button>
                </>
            )}
        </div>
    );

    return createPortal(bar, document.body);
}
