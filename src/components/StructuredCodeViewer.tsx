import {Fragment, type ReactNode} from 'react';

import type {ParserDirection, ParserFamily} from '../parser/parserTypes';

export interface StructuredCodeViewerProps {
    readonly content: string;
    readonly language: 'json' | 'text' | 'auto';
    readonly family?: ParserFamily;
    readonly direction?: ParserDirection;
    readonly maxHeight?: number;
    readonly className?: string;
    readonly ariaLabel?: string;
}

interface Token {
    readonly text: string;
    readonly type: 'comment' | 'keyword' | 'number' | 'string' | 'json-key' | 'json-boolean' | 'json-null' | 'punctuation' | 'plain' | 'whitespace';
}

const classifyRawWord = (word: string): 'keyword' | 'number' | 'string' | 'plain' => {
    if (!word) {
        return 'plain';
    }
    if (/^(?:true|false|null)$/i.test(word)) {
        return word === 'true' || word === 'false' ? 'keyword' : 'plain';
    }
    if (/^[+-]?(?:\d+(?:\.\d*)?|\d*\.\d+)(?:[eE][+-]?\d+)?$/.test(word)) {
        return 'number';
    }
    if (word.length > 1 && word.toUpperCase() === word) {
        return 'keyword';
    }
    return 'plain';
}

const splitTokensLine = (line: string): Token[] => {
    const tokens: Token[] = [];
    let index = 0;

    while (index < line.length) {
        const char = line[index];
        if (/\s/.test(char)) {
            const start = index;
            index += 1;
            while (index < line.length && /\s/.test(line[index])) {
                index += 1;
            }
            tokens.push({text: line.slice(start, index), type: 'whitespace'});
            continue;
        }

        if (char === '"') {
            const start = index;
            index += 1;
            while (index < line.length) {
                if (line[index] === '\\') {
                    index += 2;
                    continue;
                }
                if (line[index] === '"') {
                    index += 1;
                    break;
                }
                index += 1;
            }
            tokens.push({text: line.slice(start, index), type: 'string'});
            continue;
        }

        if (/[{}[\],:()=]/.test(char)) {
            tokens.push({text: char, type: 'punctuation'});
            index += 1;
            continue;
        }

        const start = index;
        if (/[A-Za-z0-9_+.-]/.test(char)) {
            index += 1;
            while (index < line.length && /[A-Za-z0-9_+.-]/.test(line[index])) {
                index += 1;
            }
            const word = line.slice(start, index);
            const kind = classifyRawWord(word);
            tokens.push({
                text: word,
                type: kind === 'keyword' ? 'keyword' : kind === 'number' ? 'number' : 'plain',
            });
            continue;
        }

        tokens.push({text: char, type: 'plain'});
        index += 1;
    }

    return tokens;
};

const tokenizeRawLine = (line: string): Token[] => {
    const isLineComment = /^\s*[cC*#]/.test(line);
    return isLineComment ? [{text: line, type: 'comment' as const}] : splitTokensLine(line);
};

const tokenizeJsonText = (text: string): Token[] => {
    const tokens: Token[] = [];
    let index = 0;

    const readWhitespace = () => {
        const start = index;
        while (index < text.length && /\s/.test(text[index])) {
            index += 1;
        }
        if (index > start) {
            tokens.push({text: text.slice(start, index), type: 'whitespace'});
        }
    };

    while (index < text.length) {
        readWhitespace();
        if (index >= text.length) {
            break;
        }

        const char = text[index];
        if (char === '"') {
            const start = index;
            index += 1;
            while (index < text.length) {
                if (text[index] === '\\') {
                    index += 2;
                    continue;
                }
                if (text[index] === '"') {
                    index += 1;
                    break;
                }
                index += 1;
            }
            const raw = text.slice(start, index);
            let cursor = index;
            while (cursor < text.length && /\s/.test(text[cursor])) {
                cursor += 1;
            }
            const isKey = cursor < text.length && text[cursor] === ':';
            tokens.push({text: raw, type: isKey ? 'json-key' : 'string'});
            continue;
        }

        if ('{}[],:'.includes(char)) {
            tokens.push({text: char, type: 'punctuation'});
            index += 1;
            continue;
        }

        const start = index;
        if (/[+-]?\d/.test(char)) {
            index += 1;
            while (index < text.length && /[0-9eE+.-]/.test(text[index])) {
                index += 1;
            }
            tokens.push({text: text.slice(start, index), type: 'number'});
            continue;
        }

        if (/[a-zA-Z]/.test(char)) {
            index += 1;
            while (index < text.length && /[a-zA-Z]/.test(text[index])) {
                index += 1;
            }
            const word = text.slice(start, index);
            if (word === 'true' || word === 'false') {
                tokens.push({text: word, type: 'json-boolean'});
            } else if (word === 'null') {
                tokens.push({text: word, type: 'json-null'});
            } else {
                tokens.push({text: word, type: 'plain'});
            }
            continue;
        }

        tokens.push({text: char, type: 'plain'});
        index += 1;
    }

    return tokens;
};

const classNameForToken = (type: Token['type']) => {
    switch (type) {
        case 'comment':
            return 'structured-code-token--comment';
        case 'keyword':
            return 'structured-code-token--keyword';
        case 'number':
            return 'structured-code-token--number';
        case 'string':
            return 'structured-code-token--string';
        case 'json-key':
            return 'structured-code-token--json-key';
        case 'json-boolean':
            return 'structured-code-token--boolean';
        case 'json-null':
            return 'structured-code-token--null';
        case 'punctuation':
            return 'structured-code-token--punctuation';
        default:
            return '';
    }
};

const renderTokens = (tokens: readonly Token[]): ReactNode => {
    return tokens.map((token, tokenIndex) => {
        if (token.type === 'whitespace' || token.type === 'plain') {
            return <Fragment key={tokenIndex}>{token.text}</Fragment>;
        }
        return (
            <span className={classNameForToken(token.type)} key={tokenIndex}>
                {token.text}
            </span>
        );
    });
};

export function StructuredCodeViewer({
    content,
    direction,
    family,
    language,
    maxHeight = 460,
    className = '',
    ariaLabel,
}: StructuredCodeViewerProps) {
    const resolvedLanguage = language === 'auto'
        ? direction && family
            ? 'text'
            : 'text'
        : language;
    const lines = content.split('\n');
    const lineNumberWidth = String(lines.length).length;

    return (
        <pre
            aria-label={ariaLabel}
            className={`structured-code-view ${resolvedLanguage} ${direction === 'input' ? 'structured-code-view--input' : ''} ${className}`}
            style={{maxHeight, overflow: 'auto'}}
        >
            <code>
                {lines.map((line, lineIndex) => {
                    const tokens = resolvedLanguage === 'json' ? tokenizeJsonText(line) : tokenizeRawLine(line);

                    return (
                        <span className="structured-code-line" key={`${lineIndex}-${line}`}>
                            <span
                                aria-hidden="true"
                                className="structured-code-line-number"
                                style={{minWidth: `${lineNumberWidth}ch`}}
                            >
                                {lineIndex + 1}
                            </span>
                            <span className="structured-code-line-content">
                                {tokens.length ? renderTokens(tokens) : ' '}
                            </span>
                        </span>
                    );
                })}
            </code>
        </pre>
    );
}
