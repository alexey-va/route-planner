import { useState } from 'react';
import { getPricingRules } from '../utils/pricingRules';

function PricingRules({ enabled = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const rules = getPricingRules();

    if (!enabled) {
        return null;
    }

    return (
        <div className="route-popover">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="route-toolbar-button"
                aria-expanded={isOpen}
                aria-label="Правила расчёта цены"
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
                Правила
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="route-popover-panel route-rules-panel">
                        <div className="route-popover-header">
                            <h3>Правила расчёта цены</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 text-gray-500 hover:text-gray-700 rounded"
                                aria-label="Закрыть"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="route-popover-content route-rules-content">
                            {rules.map((section) => (
                                <section key={section.title}>
                                    <h4>
                                        {section.title}
                                    </h4>
                                    <ul>
                                        {section.items.map((item, index) => (
                                            <li
                                                key={`${section.title}-${index}`}
                                                className={item.startsWith('  •') ? 'pl-2' : 'flex gap-2'}
                                            >
                                                {!item.startsWith('  •') && (
                                                    <span className="route-rule-bullet">•</span>
                                                )}
                                                <span className={item.startsWith('  •') ? 'text-gray-600' : ''}>
                                                    {item.startsWith('  •') ? item.slice(3) : item}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default PricingRules;
