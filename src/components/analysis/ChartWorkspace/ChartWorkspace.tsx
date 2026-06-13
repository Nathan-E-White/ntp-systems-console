import {createContext, type ReactNode, useContext, useMemo, useState} from 'react';

import type {ChartWorkspaceModel} from './ChartWorkspace.model';

export interface ChartWorkspaceProps {
    readonly model: ChartWorkspaceModel;
    readonly initialSelectedSeriesId?: string | null;
}

export interface ChartWorkspaceState {
    readonly selectedSeriesId: string | null;
    readonly cursorX: number | null;
}

export interface ChartWorkspaceContextValue {
    readonly model: ChartWorkspaceModel;
    readonly state: ChartWorkspaceState;
    readonly selectSeries: (seriesId: string | null) => void;
    readonly setCursorX: (x: number | null) => void;
}

export interface ChartWorkspaceProviderProps extends ChartWorkspaceProps {
    readonly children: ReactNode;
}

const ChartWorkspaceContext = createContext<ChartWorkspaceContextValue | undefined>(undefined);

/** Boundary: chart renderers consume normalized series only, never parser-specific records. */
export function ChartWorkspaceProvider({
    model,
    initialSelectedSeriesId = null,
    children,
}: Readonly<ChartWorkspaceProviderProps>) {
    const [selectedSeriesId, selectSeries] = useState<string | null>(initialSelectedSeriesId);
    const [cursorX, setCursorX] = useState<number | null>(null);
    const value = useMemo(() => ({
        model,
        state: {selectedSeriesId, cursorX},
        selectSeries,
        setCursorX,
    }), [cursorX, model, selectedSeriesId]);
    return <ChartWorkspaceContext.Provider value={value}>{children}</ChartWorkspaceContext.Provider>;
}

export function useChartWorkspace(): ChartWorkspaceContextValue {
    const context = useContext(ChartWorkspaceContext);
    if (!context) throw new Error('useChartWorkspace must be used inside ChartWorkspaceProvider.');
    return context;
}

export function ChartWorkspaceView() {
    const {model, state} = useChartWorkspace();
    return (
        <section
            aria-label="Engineering charts"
            data-series-count={model.series.length}
            data-selected-series={state.selectedSeriesId ?? 'none'}
        />
    );
}

export function ChartWorkspace(props: Readonly<ChartWorkspaceProps>) {
    return <ChartWorkspaceProvider {...props}><ChartWorkspaceView/></ChartWorkspaceProvider>;
}
