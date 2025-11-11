import React from 'react';
import { Card } from './shared/Card';

const Guide: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <Card title={title}>
        <div className="prose prose-sm max-w-none">
            {children}
        </div>
    </Card>
);

export const HowToPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">How-To Guides</h1>
            <p className="text-lg text-gray-600">Step-by-step instructions for common tasks in AgriFAAS Connect.</p>

            <Guide title="How to Set Up Your Farm (First Steps)">
                <p>Follow these steps to get your workspace configured and ready for use.</p>
                <ol>
                    <li><strong>Create Your Workspace:</strong> After your first login, you'll be prompted to create a workspace. Give it a name like "Sunrise Farms".</li>
                    <li><strong>Add Your Plots & Seasons:</strong> Go to the <strong>Plots & Seasons</strong> module. Add the different fields or areas you manage (e.g., "North Field," "Greenhouse 1") and the seasons you operate in (e.g., "Main Season 2024").</li>
                    <li><strong>Configure Financials:</strong> In the <strong>Financials</strong> module, click on the "Accounts" view. Review the initial Chart of Accounts and add any new accounts your business needs (e.g., a specific bank account or loan account).</li>
                    <li><strong>Add Your People:</strong> In the <strong>HR</strong> module, add all your employees and set their roles and pay rates.</li>
                    <li><strong>Add Your Suppliers:</strong> Navigate to the <strong>Suppliers</strong> module and create entries for all the vendors you purchase from.</li>
                    <li><strong>Invite Your Team:</strong> Go to the <strong>Admin</strong> module to invite your team members and assign them roles like 'Farm Manager' or 'Accountant'.</li>
                </ol>
            </Guide>

            <Guide title="How to Manage a Planting Task from Start to Finish">
                <p>This workflow shows how operations, inventory, and financials are connected.</p>
                <ol>
                    <li><strong>Add Inventory:</strong> Go to <strong>Inventory</strong> and add the items you'll use, like "Maize Seeds" and "NPK Fertilizer," making sure to select the correct supplier and enter the purchase cost.</li>
                    <li><strong>Create the Task:</strong> In <strong>Operations</strong>, click "Add Task."</li>
                    <li><strong>Fill Details:</strong> Give it a title like "Plant North Field." Assign it to a user, select the "North Field" plot, and set a due date.</li>
                    <li><strong>Link Materials:</strong> In the "Consumed Materials" section of the task form, add the "Maize Seeds" and "NPK Fertilizer" and specify the quantity you plan to use.</li>
                    <li><strong>Track Progress:</strong> Drag the task card from "To-Do" to "In Progress" on the board as work begins.</li>
                    <li><strong>Complete the Task:</strong> Once planting is done, drag the task to the "Done" column. The system will automatically reduce your seed and fertilizer stock and record the cost in your financial journal.</li>
                </ol>
            </Guide>

            <Guide title="How to Record a Sale and Track Revenue">
                <p>This guide shows the process from harvesting produce to getting paid.</p>
                <ol>
                    <li><strong>Log Your Harvest:</strong> In <strong>Harvest & Sales</strong>, go to the "Harvests" tab and click "Log New Harvest." Record what crop you harvested, from which plot, and the quantity. This adds the produce to your saleable stock.</li>
                    <li><strong>Add Your Customer:</strong> If this is a new buyer, go to the "Customers" tab and add their details first.</li>
                    <li><strong>Record the Sale:</strong> Go to the "Sales" tab and click "Record New Sale."</li>
                    <li><strong>Fill Sale Details:</strong> Select the customer, sale date, and payment status.</li>
                    <li><strong>Add Sale Items:</strong> In the "Sale Items" section, select the produce from your available harvest stock, and enter the quantity sold and the price per unit. The total amount is calculated for you.</li>
                    <li><strong>Save:</strong> Once you save, the system automatically updates the remaining quantity of your harvest stock and posts the revenue to your <strong>Financials</strong> module.</li>
                </ol>
            </Guide>
            
            <Guide title="How to Use the AI Plant Doctor">
                 <p>Get a quick diagnosis for plant issues using AI.</p>
                <ol>
                    <li><strong>Navigate:</strong> Go to the <strong>AI Insights</strong> module.</li>
                    <li><strong>Upload Image:</strong> In the "AI Plant Doctor" card, click "Select an image" and upload a clear photo of the plant leaf or affected area.</li>
                    <li><strong>Diagnose:</strong> Click the "Diagnose Plant" button.</li>
                    <li><strong>Review:</strong> The AI will analyze the image and provide a potential diagnosis along with suggestions for both organic and chemical treatments.</li>
                </ol>
            </Guide>

        </div>
    );
};
