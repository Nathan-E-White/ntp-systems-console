import {type ReactNode} from 'react';

export interface ParsedJsonBubbleViewProps {
    readonly data: unknown;
    readonly heading?: string;
    readonly maxDepth?: number;
    readonly maxItems?: number;
    readonly className?: string;
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPrimitive(value: unknown): value is string | number | boolean | null {
    return value === null || ['string', 'number', 'boolean'].includes(typeof value);
}

const valuePreview = (value: unknown): string => {
    if (typeof value === 'string') {
        return value.length > 48 ? `${value.slice(0, 45)}…` : value;
    }

    if (typeof value === 'number') {
        return Number.isFinite(value) ? value.toString() : 'NaN';
    }

    if (value === null) {
        return 'null';
    }

    return String(value);
};

function parseLabel(value: unknown): string {
    if (isObject(value)) {
        return `${Object.keys(value).length} fields`;
    }
    if (Array.isArray(value)) {
        return `${value.length} items`;
    }
    return valuePreview(value);
}

function renderBubble(value: unknown, depth: number, maxDepth: number, maxItems: number, path = 'root'): ReactNode {
    if (depth > maxDepth) {
        return <span className="parsed-json-bubble__value parsed-json-bubble__value--truncated">{parseLabel(value)}</span>;
    }

    if (isPrimitive(value)) {
        return <span className={`parsed-json-bubble__value ${typeof value}`}>{valuePreview(value)}</span>;
    }

    if (Array.isArray(value)) {
        const items = value.slice(0, maxItems);
        return (
            <div className="parsed-json-bubble__node parsed-json-bubble__node--array">
                <span className="parsed-json-bubble__node-label">{path} · {value.length} items</span>
                <div className="parsed-json-bubble__children">
                    {items.map((item, index) => (
                        <div className="parsed-json-bubble" key={`${path}-${index}`}>
                            <span className="parsed-json-bubble__child-key">[{index}]</span>
                            {renderBubble(item, depth + 1, maxDepth, maxItems, `${path}.${index}`)}
                        </div>
                    ))}
                    {value.length > maxItems ? <span className="parsed-json-bubble__overflow">+{value.length - maxItems} more</span> : null}
                </div>
            </div>
        );
    }

    if (isObject(value)) {
        const entries = Object.entries(value);
        const shown = entries.slice(0, maxItems);
        return (
            <div className="parsed-json-bubble__node parsed-json-bubble__node--object">
                <span className="parsed-json-bubble__node-label">{path} · {entries.length} fields</span>
                <div className="parsed-json-bubble__children">
                    {shown.map(([key, child]) => (
                        <div className="parsed-json-bubble" key={`${path}-${key}`}>
                            <span className="parsed-json-bubble__child-key">{key}</span>
                            {renderBubble(child, depth + 1, maxDepth, maxItems, `${path}.${key}`)}
                        </div>
                    ))}
                    {entries.length > maxItems ? <span className="parsed-json-bubble__overflow">+{entries.length - maxItems} hidden keys</span> : null}
                </div>
            </div>
        );
    }

    return <span className="parsed-json-bubble__value">unsupported</span>;
}

export function ParsedJsonBubbleView({data, heading, maxDepth = 5, maxItems = 12, className = ''}: ParsedJsonBubbleViewProps) {
    return (
        <section className={`parsed-json-bubble-view ${className}`}>
            {heading ? <h4>{heading}</h4> : null}
            <div className="parsed-json-bubble-root">
                {renderBubble(data, 0, maxDepth, maxItems)}
            </div>
        </section>
    );
}
