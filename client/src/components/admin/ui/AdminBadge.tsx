interface AdminBadgeProps {
    label: string;
    color?: string;
    bg?: string;
    size?: 'sm' | 'md';
}

const PRESETS: Record<string, { color: string; bg: string }> = {
    PENDING: { color: '#15803D', bg: '#ECFDF5' },
    ACCEPTED: { color: '#2563EB', bg: '#EFF6FF' },
    PREPARING: { color: '#7C3AED', bg: '#F5F3FF' },
    READY: { color: '#0891B2', bg: '#ECFEFF' },
    READY_TO_PICKUP: { color: '#EA580C', bg: '#FFF7ED' },
    PICKED_UP: { color: '#16A34A', bg: '#F0FDF4' },
    CANCELLED: { color: '#DC2626', bg: '#FEF2F2' },
    PAID: { color: '#16A34A', bg: '#F0FDF4' },
    FAILED: { color: '#DC2626', bg: '#FEF2F2' },
    VEG: { color: '#16A34A', bg: '#F0FDF4' },
    'NON-VEG': { color: '#DC2626', bg: '#FEF2F2' },
    ACTIVE: { color: '#16A34A', bg: '#F0FDF4' },
    INACTIVE: { color: '#8E8E8E', bg: '#F5F5F3' },
    COD: { color: '#15803D', bg: '#ECFDF5' },
    ONLINE: { color: '#2563EB', bg: '#EFF6FF' },
};

export default function AdminBadge({ label, color, bg, size = 'sm' }: AdminBadgeProps) {
    const preset = PRESETS[label.toUpperCase()] || PRESETS[label.replace(/_/g, ' ').toUpperCase()];
    const finalColor = color || preset?.color || '#4A4A4A';
    const finalBg = bg || preset?.bg || '#F5F5F3';

    return (
        <span
            className={`inline-flex items-center font-bold rounded-lg whitespace-nowrap ${
                size === 'sm' ? 'px-2.5 py-[3px] text-[0.68rem]' : 'px-3 py-1 text-[0.75rem]'
            }`}
            style={{ background: finalBg, color: finalColor }}
        >
            {label.replace(/_/g, ' ')}
        </span>
    );
}
