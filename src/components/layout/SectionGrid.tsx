

import {type ReactNode} from 'react';

type SectionGridVariant = 'analysis' | 'console';

interface SectionGridProps {
    children: ReactNode;
    className?: string;
    variant?: SectionGridVariant;
}

const sectionGridClassNames: Record<SectionGridVariant, string> = {
    analysis: 'analysis-grid',
    console: 'console-grid',
};

export function SectionGrid({children, className, variant = 'analysis'}: SectionGridProps) {
    const baseClassName = sectionGridClassNames[variant];
    const gridClassName = className === undefined ? baseClassName : `${baseClassName} ${className}`;

    return <div className={gridClassName}>{children}</div>;
}