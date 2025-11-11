

import React, { useState, useCallback } from 'react';
import { Card } from './shared/Card';
import { Button } from './shared/Button';
import { UploadIcon } from '../constants';
import * as geminiService from '../services/geminiService';
import { Input } from './shared/Input';
import type { FarmDataContextType } from '../types';

const AIResultDisplay: React.FC<{ title: string; content: string }> = ({ title, content }) => {
    const formattedContent = content.split('\n').map((line, index) => {
        if (line.match(/^(#+\s*)/)) {
             return <h3 key={index} className="text-lg font-semibold mt-2 mb-1">{line.replace(/^(#+\s*)/, '')}</h3>;
        }
        if (line.match(/^(\*\s*)/)) {
             return <li key={index} className="ml-4 list-disc">{line.replace(/^(\*\s*)/, '')}</li>;
        }
        return <p key={index} className="mb-2">{line}</p>;
    });
    return (
        <div className="mt-4 p-4 bg-gray-100 rounded-md border">
            <h4 className="font-semibold text-lg text-gray-800 mb-2">{title}</h4>
            <div className="text-gray-700 whitespace-pre-wrap font-sans">{formattedContent}</div>
        </div>
    );
};

export const AIInsights: React.FC<{ farmData: FarmDataContextType }> = ({ farmData }) => {
    const [plantImage, setPlantImage] = useState<string | null>(null);
    const [plantImagePreview, setPlantImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
    const [results, setResults] = useState<Record<string, string | null>>({});
    
    // State for planting advisor
    const [crop, setCrop] = useState('Corn');
    const [location, setLocation] = useState('Central Illinois');
    const [soilType, setSoilType] = useState('Silty Clay Loam');

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                setPlantImage(base64String);
                setPlantImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAICall = useCallback(async <T,>(
        key: string, 
        apiCall: () => Promise<T>,
        resultFormatter: (res: T) => string
    ) => {
        setIsLoading(prev => ({ ...prev, [key]: true }));
        setResults(prev => ({...prev, [key]: null }));
        try {
            const res = await apiCall();
            setResults(prev => ({ ...prev, [key]: resultFormatter(res) }));
        } catch (error) {
            console.error(`Error in ${key}:`, error);
            setResults(prev => ({ ...prev, [key]: `An error occurred. See console for details.` }));
        } finally {
            setIsLoading(prev => ({ ...prev, [key]: false }));
        }
    }, []);

    const handleDiagnosePlant = () => {
        if (!plantImage) return;
        handleAICall('plantDoctor', () => geminiService.diagnosePlant(plantImage), (res) => res);
    };
    
    const handlePlantingAdvice = () => {
        handleAICall('plantingAdvisor', () => geminiService.getPlantingAdvice(crop, location, soilType), res => res);
    };
    
    const handlePredictYield = () => {
        const dataForPrediction = {
            plots: farmData.plots.map(p => ({ name: p.name, crop: p.crop, area: p.area, soilType: p.soilType })),
            seasons: farmData.seasons.map(s => ({ name: s.name, year: s.year })),
            recentJournalEntries: farmData.journalEntries
                .slice(0, 25)
                .map(je => ({ date: je.date, description: je.description, category: je.category }))
        };
         handleAICall(
             'yieldPredictor', 
             () => geminiService.predictYield(JSON.stringify(dataForPrediction, null, 2)), 
             res => res
         );
    };
    const handleSummarizeRecords = () => {
        const dataForSummary = {
            tasks: farmData.tasks
                .slice(0, 20)
                .map(t => ({ title: t.title, status: t.status, cost: t.cost, dueDate: t.dueDate })),
            journalEntries: farmData.journalEntries
                .slice(0, 20)
                .map(je => ({ date: je.date, description: je.description, category: je.category }))
        };
        handleAICall(
            'recordSummarizer', 
            () => geminiService.summarizeRecords(JSON.stringify(dataForSummary, null, 2)), 
            res => res
        );
    };


    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="AI Plant Doctor" className="lg:col-span-2">
                <p className="mb-4 text-gray-600">Upload a photo of a plant to diagnose diseases or pests.</p>
                <div className="flex items-center space-x-4">
                     <label className="flex items-center px-4 py-2 bg-white text-green-600 rounded-lg shadow-md tracking-wide uppercase border border-green-600 cursor-pointer hover:bg-green-600 hover:text-white">
                        <UploadIcon className="w-6 h-6 mr-2" />
                        <span className="text-base leading-normal">Select an image</span>
                        <input type='file' className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                    {plantImagePreview && <img src={plantImagePreview} alt="Plant preview" className="h-24 w-24 object-cover rounded-md" />}
                    <Button onClick={handleDiagnosePlant} disabled={!plantImage || isLoading.plantDoctor}>
                        {isLoading.plantDoctor ? 'Analyzing...' : 'Diagnose Plant'}
                    </Button>
                </div>
                 {isLoading.plantDoctor && <div className="mt-4 text-center text-gray-600">AI is thinking...</div>}
                {results.plantDoctor && <AIResultDisplay title="Diagnosis Result" content={results.plantDoctor} />}
            </Card>

            <Card title="AI Planting Advisor">
                 <p className="mb-4 text-gray-600">Get recommendations for optimal planting schedules.</p>
                <div className="space-y-4">
                   <Input id="crop" label="Crop" value={crop} onChange={(e) => setCrop(e.target.value)} />
                   <Input id="location" label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
                   <Input id="soilType" label="Soil Type" value={soilType} onChange={(e) => setSoilType(e.target.value)} />
                </div>
                <Button onClick={handlePlantingAdvice} disabled={isLoading.plantingAdvisor} className="mt-4">
                     {isLoading.plantingAdvisor ? 'Getting Advice...' : 'Get Planting Advice'}
                </Button>
                 {isLoading.plantingAdvisor && <div className="mt-4 text-center text-gray-600">AI is thinking...</div>}
                 {results.plantingAdvisor && <AIResultDisplay title="Planting Advice" content={results.plantingAdvisor} />}
            </Card>

            <Card title="More AI Tools">
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold">AI Yield Prediction</h4>
                        <p className="text-gray-600 text-sm mb-2">Analyzes your plots, seasons, and recent financial entries to predict yield.</p>
                        <Button onClick={handlePredictYield} variant="secondary" disabled={isLoading.yieldPredictor}>
                            {isLoading.yieldPredictor ? 'Predicting...' : 'Predict Yield'}
                        </Button>
                        {isLoading.yieldPredictor && <div className="mt-2 text-sm text-gray-600">AI is thinking...</div>}
                        {results.yieldPredictor && <AIResultDisplay title="Yield Prediction" content={results.yieldPredictor} />}
                    </div>
                     <hr/>
                    <div>
                        <h4 className="font-semibold">AI Record Summarizer</h4>
                         <p className="text-gray-600 text-sm mb-2">Get automated reports from your recent tasks and journal entries.</p>
                        <Button onClick={handleSummarizeRecords} variant="secondary" disabled={isLoading.recordSummarizer}>
                            {isLoading.recordSummarizer ? 'Summarizing...' : 'Summarize Records'}
                        </Button>
                        {isLoading.recordSummarizer && <div className="mt-2 text-sm text-gray-600">AI is thinking...</div>}
                        {results.recordSummarizer && <AIResultDisplay title="Record Summary" content={results.recordSummarizer} />}
                    </div>
                </div>
            </Card>
        </div>
    );
};
