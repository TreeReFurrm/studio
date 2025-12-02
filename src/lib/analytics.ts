
'use client';

import Ajv, { ValidateFunction } from 'ajv';
import schema from '../../docs/analytics-schema.json';
import { User } from 'firebase/auth';

// --- CONFIGURATION ---
const ANALYTICS_ENDPOINT = "/api/analytics"; // Placeholder endpoint
const BATCH_SIZE = 20;
const BATCH_INTERVAL_MS = 5000;

// --- TYPE DEFINITIONS ---
type SchemaName = keyof typeof schema.components.schemas;

// --- CONTEXT HELPERS ---
const nowIso = () => new Date().toISOString();

const getPageContext = () => {
    if (typeof window === 'undefined') return { page: 'server', page_url: '' };
    return {
        page: document.title,
        page_url: window.location.href,
    };
};

const getSessionId = () => {
    if (typeof window === 'undefined') return 'server-session';
    let s = sessionStorage.getItem("session_id");
    if (!s) {
        s = "sess_" + Math.random().toString(36).slice(2, 10);
        sessionStorage.setItem("session_id", s);
    }
    return s;
};

const getAnonId = () => {
    if (typeof window === 'undefined') return 'server-anon';
    let a = localStorage.getItem("anon_id");
    if (!a) {
        a = "anon_" + Math.random().toString(36).slice(2, 10);
        localStorage.setItem("anon_id", a);
    }
    return a;
};


// --- SCHEMA VALIDATION (AJV) ---
const ajv = new Ajv({ allErrors: true, strict: false });
ajv.addSchema(schema, 'analytics');

const validators: Record<string, ValidateFunction> = {};
Object.keys(schema.components.schemas).forEach((key) => {
    const validator = ajv.getSchema(`analytics#/components/schemas/${key}`);
    if (validator) {
        validators[key] = validator;
    }
});


// --- EVENT QUEUE & SENDER ---
let eventQueue: any[] = [];
let flushTimer: NodeJS.Timeout | null = null;

function enqueueEvent(eventPayload: any) {
    eventQueue.push(eventPayload);
    if (eventQueue.length >= BATCH_SIZE) {
        flushNow();
        return;
    }
    if (!flushTimer) {
        flushTimer = setTimeout(() => {
            flushNow();
        }, BATCH_INTERVAL_MS);
    }
}

async function flushNow() {
    if (flushTimer) {
        clearTimeout(flushTimer);
        flushTimer = null;
    }
    if (!eventQueue.length) return;

    const batch = [...eventQueue];
    eventQueue = [];
    
    console.log('[Analytics] Flushing batch:', batch);

    // In a real implementation, you would send the data to your endpoint.
    // The keepalive flag is useful for making sure the request is sent even if the user navigates away.
    try {
        // await fetch(ANALYTICS_ENDPOINT, {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({ events: batch }),
        //     keepalive: true,
        // });
    } catch (err) {
        console.error("[Analytics] Send failed, re-queuing batch.", err);
        // Simple re-enqueue for this example. A real implementation might have exponential backoff.
        eventQueue.unshift(...batch);
    }
}


// --- CORE TRACKING FUNCTION ---
export function trackEvent(
    eventName: SchemaName,
    properties: Record<string, any>,
    user: User | null
) {
    const base = {
        event: eventName,
        user_id: user?.uid || null,
        anonymous_id: getAnonId(),
        session_id: getSessionId(),
        page: getPageContext().page,
        page_url: getPageContext().page_url,
        timestamp: nowIso(),
    };

    const payload = { ...properties, ...base };

    const validate = validators[eventName];
    if (!validate) {
        console.warn(`[Analytics] No validator for event: ${eventName}`);
        return; // Don't send events without a schema
    }

    const valid = validate(payload);
    if (!valid) {
        console.error(`[Analytics] Schema validation failed for "${eventName}":`, validate.errors);
        return; // Don't send invalid payloads
    }

    enqueueEvent(payload);
}
