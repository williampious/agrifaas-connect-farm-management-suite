

import React from 'react';
import { Modal } from './shared/Modal';

const FeatureCard: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ title, description, icon }) => (
    <div className="flex flex-col items-center text-center p-4">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-green-100 text-green-600 rounded-full mb-3">
            {icon}
        </div>
        <h4 className="font-bold text-gray-800">{title}</h4>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
    </div>
);

const BenefitCard: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ title, description, icon }) => (
     <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-green-100 text-green-600 rounded-lg">
                 {icon}
            </div>
            <div>
                 <h4 className="font-bold text-lg text-gray-800">{title}</h4>
            </div>
        </div>
        <p className="text-sm text-gray-600 mt-3">{description}</p>
    </div>
);

const Section: React.FC<{ title: string; subtitle?: string; children: React.ReactNode, className?: string }> = ({ title, subtitle, children, className = '' }) => (
    <section className={`py-8 ${className}`}>
        <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
            {subtitle && <p className="text-md text-gray-600 mt-2 max-w-2xl mx-auto">{subtitle}</p>}
        </div>
        {children}
    </section>
);


export const AboutUsModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="About AgriFAAS Connect" size="5xl">
            <div className="text-gray-700">
                <header className="text-center py-6 bg-green-50 rounded-lg">
                    <h1 className="text-4xl font-extrabold text-gray-800">AgriFAAS Connect</h1>
                    <p className="text-lg text-gray-600 mt-2">A flagship product of <span className="font-semibold text-green-600">Cure Technologies</span>.</p>
                    <p className="mt-4 max-w-3xl mx-auto text-gray-700">The unified platform for modern agribusiness, empowering every stakeholder from the field to the front office.</p>
                </header>

                <Section title="A Complete Toolkit for Modern Agribusiness" subtitle="From soil to sales, AgriFAAS Connect integrates every aspect of your operation into one powerful, easy-to-use platform.">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard title="Farm Operations Management" description="Track everything from planting to harvest. Manage seasons, plots, inventory, and tasks in one unified view." icon={<IconOps />} />
                        <FeatureCard title="Financial Control & Reporting" description="Full financial ledger, seasonal budgeting, and powerful reports on profitability by plot, crop, and season." icon={<IconFinancials />} />
                        <FeatureCard title="HR & Payroll Automation" description="Manage employee records, track time with integrated timesheets, and run automated payroll that syncs with your financials." icon={<IconHR />} />
                        <FeatureCard title="AEO & Cooperative Suite" description="Specialized tools for extension officers to manage farmer directories, log support interactions, and build a shared knowledge base." icon={<IconAEO />} />
                        <FeatureCard title="AI-Powered Insights" description="Leverage advanced AI for plant disease diagnosis, yield prediction, planting advice, and automated record summarization." icon={<IconAI />} />
                        <FeatureCard title="Inventory & Cost Tracking" description="Manage your stock of seeds, fertilizers, and equipment. Costs are automatically logged as resources are used in tasks." icon={<IconInventory />} />
                    </div>
                </Section>
                
                <div className="bg-gray-50">
                    <Section title="Why AgriFAAS Connect?" subtitle="We empower you to simplify complexity, boost productivity, and foster connection across your entire agricultural operation.">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <BenefitCard title="Simplify Complexity" description="Streamline every aspect of your farm management, from planning to harvest, all in one intuitive platform designed for ease of use." icon={<IconSimplify />} />
                             <BenefitCard title="Boost Productivity" description="Make smarter decisions with AI-powered insights, real-time data, and precision tools to optimize yields and resources effectively." icon={<IconProductivity />} />
                             <BenefitCard title="Empower Connection" description="Connect your entire team, manage roles, and access critical information, empowering every stakeholder in the agricultural value chain." icon={<IconConnection />} />
                        </div>
                    </Section>
                </div>

                <Section title="Built for the Entire Agri-Ecosystem" subtitle="Whether you run a large commercial farm, support local farmers, or manage a cooperative, our platform is designed for you.">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="p-4"><h4 className="font-bold text-lg">Commercial Farms</h4><p className="text-sm text-gray-600 mt-1">Ideal for medium-to-large scale farms needing multi-user collaboration, role-based permissions, financial dashboards, and operational tracking.</p></div>
                        <div className="p-4"><h4 className="font-bold text-lg">Agric Extension Officers & NGOs</h4><p className="text-sm text-gray-600 mt-1">A dedicated suite of tools to manage a directory of farmers, log support interactions, track progress, and provide targeted advice.</p></div>
                        <div className="p-4"><h4 className="font-bold text-lg">Farmer Associations & Cooperatives</h4><p className="text-sm text-gray-600 mt-1">Manage member data, provide extension services, aggregate production information, and streamline group operations.</p></div>
                    </div>
                </Section>

                <div className="bg-gray-50">
                    <Section title="Get Started in Minutes" subtitle="Our streamlined onboarding process gets you from registration to valuable insights in just a few simple steps.">
                        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8">
                            <div className="text-center"><div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center bg-green-600 text-white font-bold rounded-full text-xl">1</div><p>Register</p></div>
                            <div className="text-center"><div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center bg-green-600 text-white font-bold rounded-full text-xl">2</div><p>Choose Path</p></div>
                            <div className="text-center"><div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center bg-green-600 text-white font-bold rounded-full text-xl">3</div><p>Manage</p></div>
                            <div className="text-center"><div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center bg-green-600 text-white font-bold rounded-full text-xl">4</div><p>Collaborate</p></div>
                            <div className="text-center"><div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center bg-green-600 text-white font-bold rounded-full text-xl">5</div><p>Gain Insights</p></div>
                        </div>
                    </Section>
                </div>

                <footer className="pt-8 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-left">
                         <div>
                            <h4 className="font-bold text-lg mb-2">Contact Information</h4>
                            <p>support@curetchnologies.org</p>
                            <p>+233 20 372 1037</p>
                            <p>+233 24 949 9338</p>
                            <p>+233 27 711 8442</p>
                            <p className="mt-2">4th Floor, 1 Airport Square, Airport City, Accra Ghana.</p>
                        </div>
                        <div>
                             <h4 className="font-bold text-lg mb-2">Quick Links</h4>
                             <p><a href="https://agrifaasconnect.com/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Website (AgriFAAS Connect)</a></p>
                             <p><a href="https://curetechnologies.org/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Website (Cure Technologies)</a></p>
                        </div>
                    </div>
                </footer>
            </div>
        </Modal>
    );
};


// Icons
const IconOps = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>;
const IconFinancials = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const IconHR = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const IconAEO = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V5.75A2.25 2.25 0 0018 3.5H6A2.25 2.25 0 003.75 5.75v12.5A2.25 2.25 0 006 20.25z" /></svg>;
const IconAI = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const IconInventory = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
const IconSimplify = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const IconProductivity = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const IconConnection = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;