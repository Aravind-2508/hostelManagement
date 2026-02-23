/**
 * Reusable Premium UI Components
 * All surfaces use semantic CSS-var classes (bg-card, text-base, border-base)
 * so they automatically respond to the html.dark toggle.
 */

// ── Card ─────────────────────────────────────────────────────────────────────
export const Card = ({ children, className = '', hover = false, padding = true }) => (
    <div
        className={`bg-card rounded-2xl border border-base shadow-sm transition-colors duration-300
            ${hover ? 'card-hover cursor-pointer' : ''}
            ${padding ? 'p-6' : ''}
            ${className}`}
    >
        {children}
    </div>
);

// ── StatCard (KPI with gradient icon + trend badge) ───────────────────────────
export const StatCard = ({ icon: Icon, title, value, trend, trendLabel, gradient, delay = 0 }) => (
    <div
        className="bg-card rounded-2xl border border-base shadow-sm p-6 card-hover animate-fadeInUp transition-colors duration-300"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${gradient}`}>
                <Icon size={22} className="text-white" />
            </div>
            {trend !== undefined && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </span>
            )}
        </div>
        <p className="text-sm font-medium text-sub mb-1">{title}</p>
        <p className="text-3xl font-bold text-base tracking-tight">{value}</p>
        {trendLabel && <p className="text-xs text-muted mt-1">{trendLabel}</p>}
    </div>
);

// ── Badge ─────────────────────────────────────────────────────────────────────
export const Badge = ({ children, variant = 'default' }) => {
    const variants = {
        active: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        inactive: 'bg-red-50 text-red-700 border border-red-100',
        warning: 'bg-amber-50 text-amber-700 border border-amber-100',
        info: 'bg-blue-50 text-blue-700 border border-blue-100',
        default: 'bg-muted text-sub',
        primary: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant] || variants.default}`}>
            {children}
        </span>
    );
};

// ── Button ────────────────────────────────────────────────────────────────────
export const Button = ({
    children, variant = 'primary', size = 'md',
    onClick, disabled, type = 'button', className = '', icon: Icon
}) => {
    const variants = {
        primary: 'btn-primary text-white',
        secondary: 'bg-muted text-base hover:opacity-80 rounded-xl font-semibold transition',
        danger: 'bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-semibold transition border border-red-100',
        ghost: 'bg-transparent text-sub hover:bg-muted rounded-xl font-medium transition',
        success: 'bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-semibold transition shadow-sm',
        outline: 'bg-card border border-base text-base hover:bg-subtle rounded-xl font-medium transition',
    };
    const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3 text-sm' };
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center gap-2 ${variants[variant]} ${sizes[size]} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {Icon && <Icon size={16} />}
            {children}
        </button>
    );
};

// ── Modal ─────────────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
    if (!open) return null;
    const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full ${sizes[size]} bg-card rounded-2xl shadow-2xl animate-scaleIn border border-base`}>
                <div className="flex items-center justify-between px-6 py-5 border-b border-base">
                    <h2 className="text-lg font-bold text-base">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-muted hover:text-sub hover:bg-subtle transition"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <div className="px-6 py-5">{children}</div>
            </div>
        </div>
    );
};

// ── Input ─────────────────────────────────────────────────────────────────────
export const Input = ({ label, error, className = '', ...props }) => (
    <div className="w-full">
        {label && <label className="block text-sm font-medium text-sub mb-1.5">{label}</label>}
        <input
            {...props}
            className={`input-premium ${error ? 'border-red-400 focus:border-red-500' : ''} ${className}`}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
);

// ── Select ────────────────────────────────────────────────────────────────────
export const Select = ({ label, children, className = '', ...props }) => (
    <div className="w-full">
        {label && <label className="block text-sm font-medium text-sub mb-1.5">{label}</label>}
        <select {...props} className={`input-premium ${className}`}>{children}</select>
    </div>
);

// ── Textarea ──────────────────────────────────────────────────────────────────
export const Textarea = ({ label, className = '', ...props }) => (
    <div className="w-full">
        {label && <label className="block text-sm font-medium text-sub mb-1.5">{label}</label>}
        <textarea {...props} className={`input-premium resize-none ${className}`} />
    </div>
);

// ── PageHeader ────────────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, action }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
            <h1 className="text-2xl font-bold text-base">{title}</h1>
            {subtitle && <p className="text-sm text-sub mt-1">{subtitle}</p>}
        </div>
        {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
);

// ── EmptyState ────────────────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 bg-muted rounded-2xl mb-4">
            {Icon && <Icon size={32} className="text-muted" />}
        </div>
        <p className="text-base font-semibold">{title}</p>
        {description && <p className="text-sm text-muted mt-1">{description}</p>}
    </div>
);

// ── Skeleton ──────────────────────────────────────────────────────────────────
export const Skeleton = ({ className = '' }) => (
    <div className={`skeleton ${className}`} />
);

// ── SectionHeading ────────────────────────────────────────────────────────────
export const SectionHeading = ({ icon: Icon, title, action }) => (
    <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
            {Icon && <Icon size={18} className="text-indigo-500" />}
            <h2 className="font-bold text-base">{title}</h2>
        </div>
        {action}
    </div>
);
