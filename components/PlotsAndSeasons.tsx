import React, { useState, useEffect } from 'react';
import type { FarmDataContextType, Plot, Season, User } from '../types';
import { Card } from './shared/Card';
import { Table } from './shared/Table';
import { Button } from './shared/Button';
import { Modal } from './shared/Modal';
import { Input } from './shared/Input';

interface PlotModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (plot: Omit<Plot, 'id'> | Plot) => void;
    initialData: Plot | null;
}

const PlotModal: React.FC<PlotModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [name, setName] = useState('');
    const [crop, setCrop] = useState('');
    const [area, setArea] = useState(0);
    const [soilType, setSoilType] = useState('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setCrop(initialData.crop);
            setArea(initialData.area);
            setSoilType(initialData.soilType);
        } else {
            // Reset form for new plot
            setName('');
            setCrop('');
            setArea(0);
            setSoilType('');
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !crop || area <= 0) {
            alert('Please fill out all required fields with valid values.');
            return;
        }
        const plotData = { name, crop, area, soilType };
        if (initialData) {
            onSubmit({ ...plotData, id: initialData.id });
        } else {
            onSubmit(plotData);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Plot' : 'Add New Plot'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input id="plot-name" label="Plot Name" type="text" value={name} onChange={e => setName(e.target.value)} required />
                <Input id="plot-crop" label="Current Crop" type="text" value={crop} onChange={e => setCrop(e.target.value)} required />
                <Input id="plot-area" label="Area (acres)" type="number" step="0.1" value={area} onChange={e => setArea(Number(e.target.value))} required />
                <Input id="plot-soil" label="Soil Type" type="text" value={soilType} onChange={e => setSoilType(e.target.value)} />
                <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Plot</Button>
                </div>
            </form>
        </Modal>
    );
};


interface SeasonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (season: Omit<Season, 'id'> | Season) => void;
    initialData: Season | null;
}

const SeasonModal: React.FC<SeasonModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [name, setName] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setYear(initialData.year);
        } else {
            setName('');
            setYear(new Date().getFullYear());
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !year) {
            alert('Please fill out all fields.');
            return;
        }
        const seasonData = { name, year };
        if (initialData) {
            onSubmit({ ...seasonData, id: initialData.id });
        } else {
            onSubmit(seasonData);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Season' : 'Add New Season'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input id="season-name" label="Season Name (e.g., Spring Planting)" type="text" value={name} onChange={e => setName(e.target.value)} required />
                <Input id="season-year" label="Year" type="number" value={year} onChange={e => setYear(Number(e.target.value))} required />
                <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Season</Button>
                </div>
            </form>
        </Modal>
    );
};


export const PlotsAndSeasons: React.FC<{ farmData: FarmDataContextType, user: User }> = ({ farmData, user }) => {
    const { plots, addPlot, updatePlot, deletePlot, seasons, addSeason, updateSeason, deleteSeason } = farmData;
    const [isPlotModalOpen, setIsPlotModalOpen] = useState(false);
    const [editingPlot, setEditingPlot] = useState<Plot | null>(null);
    const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
    const [editingSeason, setEditingSeason] = useState<Season | null>(null);

    const handleOpenAddPlotModal = () => {
        setEditingPlot(null);
        setIsPlotModalOpen(true);
    };

    const handleOpenEditPlotModal = (plot: Plot) => {
        setEditingPlot(plot);
        setIsPlotModalOpen(true);
    };

    const handleClosePlotModal = () => {
        setIsPlotModalOpen(false);
        setEditingPlot(null);
    };

    const handleSubmitPlot = (plotData: Omit<Plot, 'id'> | Plot) => {
        if ('id' in plotData) {
            updatePlot(plotData, user.name);
        } else {
            addPlot(plotData, user.name);
        }
        handleClosePlotModal();
    };

    const handleDeletePlot = (plot: Plot) => {
        if (window.confirm('Are you sure you want to delete this plot? This action cannot be undone.')) {
            deletePlot(plot.id, user.name, plot.name);
        }
    };
    
    const handleOpenAddSeasonModal = () => {
        setEditingSeason(null);
        setIsSeasonModalOpen(true);
    };

    const handleOpenEditSeasonModal = (season: Season) => {
        setEditingSeason(season);
        setIsSeasonModalOpen(true);
    };

    const handleCloseSeasonModal = () => {
        setIsSeasonModalOpen(false);
        setEditingSeason(null);
    };

    const handleSubmitSeason = (seasonData: Omit<Season, 'id'> | Season) => {
        if ('id' in seasonData) {
            updateSeason(seasonData, user.name);
        } else {
            addSeason(seasonData, user.name);
        }
        handleCloseSeasonModal();
    };

    const handleDeleteSeason = (season: Season) => {
        if (window.confirm('Are you sure you want to delete this season? This action cannot be undone.')) {
            deleteSeason(season.id, user.name, `${season.name} ${season.year}`);
        }
    };


    const plotColumns = [
        { header: 'Plot Name', accessor: 'name' as keyof Plot },
        { header: 'Current Crop', accessor: 'crop' as keyof Plot },
        { header: 'Area (acres)', accessor: 'area' as keyof Plot },
        { header: 'Soil Type', accessor: 'soilType' as keyof Plot },
    ];

    const seasonColumns = [
        { header: 'Season Name', accessor: 'name' as keyof Season },
        { header: 'Year', accessor: 'year' as keyof Season },
    ];

    return (
        <>
            <PlotModal
                isOpen={isPlotModalOpen}
                onClose={handleClosePlotModal}
                onSubmit={handleSubmitPlot}
                initialData={editingPlot}
            />
            <SeasonModal
                isOpen={isSeasonModalOpen}
                onClose={handleCloseSeasonModal}
                onSubmit={handleSubmitSeason}
                initialData={editingSeason}
            />
            <div className="space-y-6">
                <Card title="Farm Plots">
                    <div className="flex justify-end mb-4">
                        <Button onClick={handleOpenAddPlotModal}>Add Plot</Button>
                    </div>
                    <Table<Plot>
                        columns={plotColumns}
                        data={plots}
                        renderActions={(plot) => (
                            <div className="space-x-2">
                                <Button variant="secondary" className="text-sm py-1 px-2" onClick={() => handleOpenEditPlotModal(plot)}>
                                    Edit
                                </Button>
                                <Button variant="danger" className="text-sm py-1 px-2" onClick={() => handleDeletePlot(plot)}>
                                    Delete
                                </Button>
                            </div>
                        )}
                    />
                </Card>
                <Card title="Season Planning">
                    <div className="flex justify-end mb-4">
                        <Button onClick={handleOpenAddSeasonModal}>Add Season</Button>
                    </div>
                    <Table<Season>
                        columns={seasonColumns}
                        data={seasons}
                        renderActions={(season) => (
                            <div className="space-x-2">
                                <Button variant="secondary" className="text-sm py-1 px-2" onClick={() => handleOpenEditSeasonModal(season)}>
                                    Edit
                                </Button>
                                <Button variant="danger" className="text-sm py-1 px-2" onClick={() => handleDeleteSeason(season)}>
                                    Delete
                                </Button>
                            </div>
                        )}
                    />
                </Card>
            </div>
        </>
    );
};