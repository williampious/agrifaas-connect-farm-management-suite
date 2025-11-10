import React, { useState, useEffect, useCallback } from 'react';
import { Input } from './Input';
import type { Plot, Season } from '../../types';

export interface FilterValue {
    startDate: string | null;
    endDate: string | null;
    plotId: string;
    seasonId: string;
}

interface FinancialReportFiltersProps {
    onChange: (filter: FilterValue) => void;
    plots: Plot[];
    seasons: Season[];
    showPlotSeasonFilters?: boolean;
}

type FilterType = 'all' | 'year' | 'range';

export const FinancialReportFilters: React.FC<FinancialReportFiltersProps> = ({ 
    onChange, 
    plots, 
    seasons,
    showPlotSeasonFilters = true 
}) => {
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [year, setYear] = useState(new Date().getFullYear());
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [plotId, setPlotId] = useState('all');
    const [seasonId, setSeasonId] = useState('all');

    const stableOnChange = useCallback(onChange, []);

    useEffect(() => {
        let newFilter: FilterValue;
        let sDate: string | null = null;
        let eDate: string | null = null;

        switch (filterType) {
            case 'year':
                sDate = `${year}-01-01`;
                eDate = `${year}-12-31`;
                break;
            case 'range':
                sDate = startDate || null;
                eDate = endDate || null;
                break;
            case 'all':
            default:
                break;
        }

        newFilter = {
            startDate: sDate,
            endDate: eDate,
            plotId,
            seasonId
        }
        stableOnChange(newFilter);
    }, [filterType, year, startDate, endDate, plotId, seasonId, stableOnChange]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-50 p-4 rounded-lg mb-6">
            <div>
                <label htmlFor="filter-type" className="block text-sm font-medium text-gray-700 mb-1">Date Filter</label>
                <select 
                    id="filter-type" 
                    value={filterType} 
                    onChange={e => setFilterType(e.target.value as FilterType)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white text-gray-900"
                >
                    <option value="all">All Time</option>
                    <option value="year">By Year</option>
                    <option value="range">Custom Range</option>
                </select>
            </div>

            {filterType === 'year' && (
                <div className="md:col-span-1">
                     <Input
                        id="filter-year"
                        label="Year"
                        type="number"
                        value={year.toString()}
                        onChange={e => setYear(Number(e.target.value))}
                    />
                </div>
            )}
            {filterType === 'range' && (
                <>
                    <div className="md:col-span-1">
                        <Input
                            id="filter-start-date"
                            label="Start Date"
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-1">
                        <Input
                            id="filter-end-date"
                            label="End Date"
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                        />
                    </div>
                </>
            )}

            {showPlotSeasonFilters && (
                <>
                    <div className="md:col-start-1">
                        <label htmlFor="plot-filter" className="block text-sm font-medium text-gray-700 mb-1">Plot</label>
                        <select id="plot-filter" value={plotId} onChange={e => setPlotId(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white text-gray-900">
                            <option value="all">All Plots</option>
                            {plots.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="season-filter" className="block text-sm font-medium text-gray-700 mb-1">Season</label>
                        <select id="season-filter" value={seasonId} onChange={e => setSeasonId(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white text-gray-900">
                            <option value="all">All Seasons</option>
                            {seasons.map(s => <option key={s.id} value={s.id}>{`${s.name} ${s.year}`}</option>)}
                        </select>
                    </div>
                </>
            )}
        </div>
    );
};