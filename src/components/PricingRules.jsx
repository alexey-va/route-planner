import { useState } from 'react';
import { getPricingRules } from '../utils/pricingRules';

function PricingRules() {
    const [isOpen, setIsOpen] = useState(false);
    const rules = getPricingRules();

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
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

                    <div className="absolute right-0 top-full mt-2 w-[28rem] max-w-[calc(100vw-2rem)] max-h-[32rem] bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-semibold text-lg">Правила расчёта цены</h3>
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

                        <div className="overflow-y-auto flex-1 p-3 space-y-4">
                            {rules.map((section) => (
                                <section key={section.title}>
                                    <h4 className="font-semibold text-gray-900 mb-1.5">
                                        {section.title}
                                    </h4>
                                    <ul className="space-y-1 text-sm text-gray-700">
                                        {section.items.map((item, index) => (
                                            <li
                                                key={`${section.title}-${index}`}
                                                className={item.startsWith('  •') ? 'pl-2' : 'flex gap-2'}
                                            >
                                                {!item.startsWith('  •') && (
                                                    <span className="text-blue-500 mt-0.5 shrink-0">•</span>
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
