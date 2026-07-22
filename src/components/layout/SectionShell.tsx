

import {type ReactNode} from 'react';

interface SectionShellProps {
    children: ReactNode;
    description: string;
    eyebrow: string;
    title: string;
    titleId: string;
}

export function SectionShell({children, description, eyebrow, title, titleId}: SectionShellProps) {
    return (
        <section className="section-workspace" aria-labelledby={titleId}>
            <header className="section-workspace__header">
                <p className="eyebrow">{eyebrow}</p>
                <h2 className="type-section-title" id={titleId}>{title}</h2>
                <p className="type-review-prose">{description}</p>
            </header>

            {children}
        </section>
    );
}
