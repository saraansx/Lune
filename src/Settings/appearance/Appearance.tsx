import React from 'react';
import './Appearance.css';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme, AccentColor } from '../../context/ThemeContext';

const Appearance: React.FC = () => {
    const { t } = useLanguage();
    const {
        accentColor, setAccentColor,
        layoutDensity, setLayoutDensity,
        dynamicColor, setDynamicColor,
    } = useTheme();

    const ACCENT_COLORS: { id: AccentColor; name: string; hex: string }[] = [
        { id: 'slate',  name: t('appearance.color.slate'),  hex: '#64748b' },
        { id: 'zinc',   name: t('appearance.color.zinc'),   hex: '#71717a' },
        { id: 'stone',  name: t('appearance.color.stone'),  hex: '#78716c' },
        { id: 'red',    name: t('appearance.color.red'),    hex: '#dc2626' },
        { id: 'orange', name: t('appearance.color.orange'), hex: '#f97316' },
        { id: 'yellow', name: t('appearance.color.yellow'), hex: '#eab308' },
        { id: 'green',  name: t('appearance.color.green'),  hex: '#22c55e' },
        { id: 'blue',   name: t('appearance.color.blue'),   hex: '#0077f9' },
        { id: 'violet', name: t('appearance.color.violet'), hex: '#8b5cf6' },
        { id: 'rose',   name: t('appearance.color.rose'),   hex: '#ec4899' },
    ];

    return (
        <div className="settings-language-card">
            <div className="settings-account-header">
                <h2 className="settings-account-title">{t('appearance.title')}</h2>
                <p className="settings-account-description">{t('appearance.sub')}</p>
            </div>

            <div className="language-content">

                {/* ── Dynamic Color ── */}
                <div className="settings-row dynamic-color-row">
                    <div className="row-info">
                        <div className="dynamic-color-label-wrap">
                            <span className="row-label" style={{ fontWeight: 400 }}>
                                {t('appearance.dynamicColorLabel')}
                            </span>
                            {dynamicColor && (
                                <span className="dynamic-color-live-badge">
                                    <span className="dynamic-color-live-dot" />
                                    Live
                                </span>
                            )}
                        </div>
                        <span className="row-sub">{t('appearance.dynamicColorSub')}</span>
                    </div>
                    <button
                        className={`lune-toggle ${dynamicColor ? 'on' : ''}`}
                        onClick={() => setDynamicColor(!dynamicColor)}
                        aria-pressed={dynamicColor}
                        title={t('appearance.dynamicColorLabel')}
                    >
                        <span className="lune-toggle-thumb" />
                    </button>
                </div>

                {/* ── Accent Color ── */}
                <div
                    className={`settings-row accent-section ${dynamicColor ? 'accent-section--dimmed' : ''}`}
                    style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}
                >
                    <div className="row-info">
                        <span className="row-label" style={{ fontWeight: 400 }}>
                            {t('appearance.accentLabel')}
                        </span>
                        <span className="row-sub">
                            {dynamicColor
                                ? t('appearance.accentSubDynamic')
                                : t('appearance.accentSub')}
                        </span>
                    </div>

                    <div className={`accent-color-grid ${dynamicColor ? 'accent-color-grid--disabled' : ''}`}>
                        {ACCENT_COLORS.map((color) => (
                            <button
                                key={color.id}
                                className={`accent-color-btn ${accentColor === color.id && !dynamicColor ? 'active' : ''}`}
                                onClick={() => {
                                    if (dynamicColor) return;
                                    setAccentColor(color.id);
                                }}
                                style={{ '--color-val': color.hex } as React.CSSProperties}
                                title={color.name}
                                disabled={dynamicColor}
                            >
                                <div className="accent-color-circle" style={{ backgroundColor: color.hex }}>
                                    {accentColor === color.id && !dynamicColor && (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </div>
                                <span className="accent-color-name">{color.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Layout Density ── */}
                <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
                    <div className="row-info">
                        <span className="row-label" style={{ fontWeight: 400 }}>{t('appearance.densityLabel')}</span>
                        <span className="row-sub">{t('appearance.densitySub')}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                        <button
                            className={`density-toggle-btn ${layoutDensity === 'comfortable' ? 'active' : ''}`}
                            onClick={() => setLayoutDensity('comfortable')}
                        >
                            {t('appearance.comfortable')}
                        </button>
                        <button
                            className={`density-toggle-btn ${layoutDensity === 'compact' ? 'active' : ''}`}
                            onClick={() => setLayoutDensity('compact')}
                        >
                            {t('appearance.compact')}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Appearance;
