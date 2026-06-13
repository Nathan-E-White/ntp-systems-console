import {Component, type ErrorInfo, type ReactNode} from 'react';

export interface UtilizationBarProps {
    label: string;
    value: number;
}

interface UtilizationBarBoundaryProps {
    children: ReactNode;
    label: string;
    value: number;
}

interface UtilizationBarBoundaryState {
    hasError: boolean;
}

export function UtilizationBar(props: Readonly<UtilizationBarProps>) {
    return (
        <UtilizationBarBoundary label={props.label} value={props.value}>
            <UtilizationBarContent {...props}/>
        </UtilizationBarBoundary>
    );
}

class UtilizationBarBoundary extends Component<Readonly<UtilizationBarBoundaryProps>, UtilizationBarBoundaryState> {
    override state: UtilizationBarBoundaryState = {
        hasError: false,
    };

    static getDerivedStateFromError(): UtilizationBarBoundaryState {
        return {hasError: true};
    }

    override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('UtilizationBar render failed.', {
            error,
            componentStack: errorInfo.componentStack,
            label: this.props.label,
            value: this.props.value,
        });
    }

    override render() {
        if (this.state.hasError) {
            return <UtilizationBarFallback label={this.props.label}/>;
        }

        return this.props.children;
    }
}

function UtilizationBarContent({label, value}: Readonly<UtilizationBarProps>) {
    if (!Number.isFinite(value)) {
        console.error('UtilizationBar received a non-finite value.', {label, value});
        return <UtilizationBarFallback label={label}/>;
    }

    const boundedValue = Math.min(Math.max(value, 0), 1.25);
    const percent = Math.round(boundedValue * 100);
    const displayedWidthPercent = Math.min(percent, 100);

    return (
        <div className="utilization-row">
            <div className="metric-row">
                <dt>{label}</dt>
                <dd>{percent}%</dd>
            </div>
            <div className="utilization-track" aria-label={`${label}: ${percent}%`}>
                <span className={buildUtilizationClassName(value)} style={{width: `${displayedWidthPercent}%`}}/>
            </div>
        </div>
    );
}

function UtilizationBarFallback({label}: Readonly<{ label: string }>) {
    return (
        <div className="utilization-row" data-utilization-error="true">
            <div className="metric-row">
                <dt>{label}</dt>
                <dd>n/a</dd>
            </div>
            <div className="utilization-track" aria-label={`${label}: unavailable`}>
                <span className="utilization-fill watch" style={{width: '0%'}}/>
            </div>
        </div>
    );
}

function buildUtilizationClassName(value: number): string {
    if (value >= 1) {
        return 'utilization-fill limit';
    }

    if (value >= 0.85) {
        return 'utilization-fill watch';
    }

    return 'utilization-fill nominal';
}