const DEFAULT_PRODUCTION_ENDPOINT = 'https://utils.alexeyav.ru/api/client-events';
const FLUSH_DELAY_MS = 1500;
const MAX_QUEUE_SIZE = 50;
const MAX_BATCH_SIZE = 20;
const MAX_FIELD_LENGTH = 160;
const INPUT_DEBOUNCE_MS = 500;

function telemetryEndpoint() {
    return import.meta.env.VITE_CLIENT_EVENTS_ENDPOINT
        || (import.meta.env.PROD ? DEFAULT_PRODUCTION_ENDPOINT : '/api/client-events');
}

function safeText(value, maxLength = MAX_FIELD_LENGTH) {
    if (typeof value !== 'string') return undefined;

    const normalized = Array.from(value, (character) => {
        const codePoint = character.codePointAt(0);
        return codePoint <= 31 || codePoint === 127 ? ' ' : character;
    }).join('').trim();

    return normalized ? normalized.slice(0, maxLength) : undefined;
}

function randomId(windowRef) {
    try {
        if (typeof windowRef.crypto?.randomUUID === 'function') {
            return windowRef.crypto.randomUUID();
        }

        const bytes = new Uint8Array(16);
        windowRef.crypto.getRandomValues(bytes);
        return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    } catch {
        return `${Date.now().toString(36)}-telemetry`;
    }
}

function sessionId(windowRef) {
    const storageKey = 'route-planner-telemetry-session';

    try {
        const existing = windowRef.sessionStorage.getItem(storageKey);
        if (existing) return existing;

        const created = randomId(windowRef);
        windowRef.sessionStorage.setItem(storageKey, created);
        return created;
    } catch {
        return randomId(windowRef);
    }
}

function clientId(windowRef) {
    const storageKey = 'route-planner-telemetry-client';

    try {
        const existing = windowRef.localStorage.getItem(storageKey);
        if (existing) return existing;

        const created = randomId(windowRef);
        windowRef.localStorage.setItem(storageKey, created);
        return created;
    } catch {
        return randomId(windowRef);
    }
}

function currentUiMode(windowRef) {
    try {
        return new URLSearchParams(windowRef.location.search).get('ui') === 'modern'
            ? 'modern'
            : 'legacy';
    } catch {
        return 'unknown';
    }
}

function targetMetadata(target) {
    const ElementConstructor = target?.ownerDocument?.defaultView?.Element;
    if (!ElementConstructor || !(target instanceof ElementConstructor)) {
        return {};
    }

    const actionable = target.closest('button, a, input, select, textarea, form, [role="button"]')
        || target;

    const classKey = Array.from(actionable.classList || [])
        .filter((token) => /^[a-zA-Z][a-zA-Z0-9_-]{1,63}$/.test(token))
        .slice(0, 3)
        .join('.');

    return {
        targetTag: actionable.tagName.toLowerCase(),
        targetKey: safeText(
            actionable.dataset.telemetryAction
            || actionable.id
            || actionable.getAttribute('name')
            || classKey,
        ),
        targetType: safeText(
            actionable.getAttribute('type')
            || actionable.getAttribute('role'),
            40,
        ),
    };
}

function fieldState(target) {
    const tagName = target?.tagName?.toLowerCase();
    if (!['input', 'select', 'textarea'].includes(tagName)) return undefined;

    const type = target.getAttribute('type')?.toLowerCase();
    if (type === 'password') return 'redacted';
    if (type === 'checkbox' || type === 'radio') {
        return target.checked ? 'checked' : 'unchecked';
    }
    return target.value ? 'nonempty' : 'empty';
}

function safeNumber(value, min = 0) {
    return Number.isFinite(value) ? Math.max(min, Math.round(value)) : undefined;
}

export function createClientTelemetry({
    windowRef = window,
    endpoint = telemetryEndpoint(),
    fetchImpl = windowRef.fetch?.bind(windowRef),
    beaconImpl = windowRef.navigator?.sendBeacon?.bind(windowRef.navigator),
} = {}) {
    const queue = [];
    const attachedDocuments = new WeakMap();
    const telemetryClientId = clientId(windowRef);
    const telemetrySessionId = sessionId(windowRef);
    const telemetryPageViewId = randomId(windowRef);
    const pageStartedAt = Date.now();
    let lastEventAt = pageStartedAt;
    let sequence = 0;
    let flushTimer = null;
    let started = false;
    let detachMainDocument = () => {};

    const handlePageHide = () => flush({ beacon: true });
    const handleError = (event) => {
        track('ui_error', { detail: event.error?.name || 'Error' });
    };
    const handleUnhandledRejection = (event) => {
        track('unhandled_rejection', {
            detail: event.reason?.constructor?.name || typeof event.reason,
        });
    };

    const flush = ({ beacon = false } = {}) => {
        if (flushTimer !== null) {
            windowRef.clearTimeout(flushTimer);
            flushTimer = null;
        }
        if (queue.length === 0) return;

        const events = queue.splice(0, MAX_BATCH_SIZE);
        const body = JSON.stringify({ events });

        try {
            if (beacon && beaconImpl) {
                beaconImpl(endpoint, new Blob([body], { type: 'text/plain;charset=UTF-8' }));
            } else if (fetchImpl) {
                Promise.resolve(fetchImpl(endpoint, {
                    method: 'POST',
                    mode: 'no-cors',
                    credentials: 'omit',
                    keepalive: true,
                    headers: {
                        'Content-Type': 'text/plain;charset=UTF-8',
                    },
                    body,
                })).catch(() => {});
            }
        } catch {
            // Telemetry must never affect the calculator.
        }

        if (queue.length > 0) {
            flushTimer = windowRef.setTimeout(flush, FLUSH_DELAY_MS);
        }
    };

    const scheduleFlush = () => {
        if (flushTimer === null) {
            flushTimer = windowRef.setTimeout(flush, FLUSH_DELAY_MS);
        }
    };

    const track = (type, details = {}) => {
        try {
            const now = Date.now();
            sequence += 1;
            const event = {
                eventId: randomId(windowRef),
                clientId: telemetryClientId,
                sessionId: telemetrySessionId,
                pageViewId: telemetryPageViewId,
                occurredAt: new Date().toISOString(),
                sequence,
                elapsedMs: safeNumber(now - pageStartedAt),
                sincePreviousMs: safeNumber(now - lastEventAt),
                type: safeText(type, 64) || 'unknown',
                page: safeText(windowRef.location.pathname, 120) || '/',
                uiMode: safeText(details.uiMode, 24) || currentUiMode(windowRef),
                targetTag: safeText(details.targetTag, 32),
                targetKey: safeText(details.targetKey),
                targetType: safeText(details.targetType, 40),
                detail: safeText(details.detail),
                viewportWidth: Number.isFinite(windowRef.innerWidth) ? windowRef.innerWidth : undefined,
                viewportHeight: Number.isFinite(windowRef.innerHeight) ? windowRef.innerHeight : undefined,
                screenWidth: safeNumber(windowRef.screen?.width),
                screenHeight: safeNumber(windowRef.screen?.height),
                durationMs: safeNumber(details.durationMs),
                changed: typeof details.changed === 'boolean' ? details.changed : undefined,
                fieldState: safeText(details.fieldState, 40),
                webdriver: windowRef.navigator?.webdriver === true,
                language: safeText(windowRef.navigator?.language, 40),
                platform: safeText(
                    windowRef.navigator?.userAgentData?.platform
                    || windowRef.navigator?.platform,
                    40,
                ),
                hardwareConcurrency: safeNumber(windowRef.navigator?.hardwareConcurrency),
                maxTouchPoints: safeNumber(windowRef.navigator?.maxTouchPoints),
            };
            lastEventAt = now;

            if (queue.length >= MAX_QUEUE_SIZE) queue.shift();
            queue.push(event);
            scheduleFlush();
        } catch {
            // Telemetry must never affect the calculator.
        }
    };

    const attachDocument = (documentRef, context = {}) => {
        if (!documentRef || attachedDocuments.has(documentRef)) {
            return attachedDocuments.get(documentRef) || (() => {});
        }

        const focusStates = new WeakMap();
        const inputTimers = new Map();
        const eventDetails = (target, details = {}) => ({
            ...context,
            ...targetMetadata(target),
            fieldState: fieldState(target),
            ...details,
        });
        const handleClick = (event) => track('click', {
            ...eventDetails(event.target),
        });
        const handleChange = (event) => track('change', {
            ...eventDetails(event.target, { changed: true }),
        });
        const handleSubmit = (event) => track('submit', {
            ...eventDetails(event.target),
        });
        const handleFocus = (event) => {
            focusStates.set(event.target, {
                focusedAt: Date.now(),
                initialState: fieldState(event.target),
                changed: false,
            });
            track('focus', eventDetails(event.target));
        };
        const handleInput = (event) => {
            const state = focusStates.get(event.target);
            if (state) state.changed = true;

            const existingTimer = inputTimers.get(event.target);
            if (existingTimer !== undefined) windowRef.clearTimeout(existingTimer);
            inputTimers.set(event.target, windowRef.setTimeout(() => {
                inputTimers.delete(event.target);
                track('input', eventDetails(event.target, { changed: true }));
            }, INPUT_DEBOUNCE_MS));
        };
        const handleBlur = (event) => {
            const timer = inputTimers.get(event.target);
            if (timer !== undefined) {
                windowRef.clearTimeout(timer);
                inputTimers.delete(event.target);
            }
            const state = focusStates.get(event.target);
            track('blur', eventDetails(event.target, {
                durationMs: state ? Date.now() - state.focusedAt : undefined,
                changed: state
                    ? state.changed || state.initialState !== fieldState(event.target)
                    : undefined,
            }));
            focusStates.delete(event.target);
        };

        documentRef.addEventListener('click', handleClick, true);
        documentRef.addEventListener('change', handleChange, true);
        documentRef.addEventListener('submit', handleSubmit, true);
        documentRef.addEventListener('focusin', handleFocus, true);
        documentRef.addEventListener('input', handleInput, true);
        documentRef.addEventListener('focusout', handleBlur, true);

        const detach = () => {
            documentRef.removeEventListener('click', handleClick, true);
            documentRef.removeEventListener('change', handleChange, true);
            documentRef.removeEventListener('submit', handleSubmit, true);
            documentRef.removeEventListener('focusin', handleFocus, true);
            documentRef.removeEventListener('input', handleInput, true);
            documentRef.removeEventListener('focusout', handleBlur, true);
            inputTimers.forEach((timer) => windowRef.clearTimeout(timer));
            inputTimers.clear();
            attachedDocuments.delete(documentRef);
        };
        attachedDocuments.set(documentRef, detach);
        return detach;
    };

    const start = () => {
        if (started) return;
        started = true;

        detachMainDocument = attachDocument(windowRef.document);
        windowRef.addEventListener('pagehide', handlePageHide);
        windowRef.addEventListener('error', handleError);
        windowRef.addEventListener('unhandledrejection', handleUnhandledRejection);
        track('page_view');
    };

    const stop = () => {
        if (!started) return;
        started = false;
        detachMainDocument();
        windowRef.removeEventListener('pagehide', handlePageHide);
        windowRef.removeEventListener('error', handleError);
        windowRef.removeEventListener('unhandledrejection', handleUnhandledRejection);
        if (flushTimer !== null) {
            windowRef.clearTimeout(flushTimer);
            flushTimer = null;
        }
        queue.length = 0;
    };

    return {
        attachDocument,
        flush,
        start,
        stop,
        track,
        pendingCount: () => queue.length,
    };
}

let telemetry;

export function initClientTelemetry() {
    try {
        telemetry ||= createClientTelemetry();
        telemetry.start();
    } catch {
        // Telemetry must never affect application startup.
    }
}

export function trackClientEvent(type, details) {
    try {
        telemetry?.track(type, details);
    } catch {
        // Telemetry must never affect the calculator.
    }
}

export function attachClientTelemetryDocument(documentRef, context) {
    try {
        return telemetry?.attachDocument(documentRef, context) || (() => {});
    } catch {
        return () => {};
    }
}
