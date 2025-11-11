import React from 'react';
import { Card } from './shared/Card';

const FAQSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <Card>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">{title}</h2>
        <div className="space-y-2">
            {children}
        </div>
    </Card>
);

const FAQItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => (
    <details className="p-4 rounded-lg bg-gray-50 group">
        <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
            {question}
            <span className="group-open:rotate-90 transition-transform duration-200">▶</span>
        </summary>
        <div className="mt-3 text-gray-600 prose prose-sm max-w-none">
            {children}
        </div>
    </details>
);

export const FAQPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Frequently Asked Questions</h1>
            <p className="text-lg text-gray-600">Find answers to common questions about using AgriFAAS Connect.</p>
            
            <FAQSection title="Getting Started">
                <FAQItem question="How do I create an account?">
                    <p>On the main login screen, click the "Create Account" tab. You'll need to provide your full name, email address, and a password. After creating your account, you will be prompted to create your first workspace.</p>
                </FAQItem>
                <FAQItem question="What is a workspace and how do I create one?">
                    <p>A workspace is your private, secure area for managing a specific farm or business. It contains all your data, from plots and tasks to financials and employees. If you're a new user, you'll be guided to create one after signing up. Just give your farm a name, and you're ready to go!</p>
                </FAQItem>
                 <FAQItem question="How do I invite my team members?">
                    <p>Go to the <strong>Admin</strong> module (you must be an 'owner' to access this). Under the "Members" tab, click the "Invite User" button. You can then enter their email address and assign them a role. They will receive an email, or you can share the Workspace ID with them to join manually.</p>
                </FAQItem>
                <FAQItem question="I received an invitation. How do I join a workspace?">
                    <p>On the main login screen, click the "Join Workspace" tab. Enter your name, email, and the Workspace ID provided in your invitation. You'll be added to the team and can then log in normally.</p>
                </FAQItem>
            </FAQSection>

            <FAQSection title="Operations & Tasks">
                 <FAQItem question="What happens when I link inventory items to a task and mark it as 'Done'?">
                     <p>This is a powerful automation feature. When you link materials (e.g., 2 bags of fertilizer) to a task and then change the task's status to 'Done', two things happen automatically:</p>
                     <ol>
                        <li>The quantity of that item is deducted from your <strong>Inventory</strong>.</li>
                        <li>The cost of the consumed materials is recorded as an expense in your <strong>Financials</strong> journal.</li>
                     </ol>
                </FAQItem>
                <FAQItem question="I can't add an inventory item to a task.">
                    <p>Make sure the inventory item you're looking for has a quantity greater than zero. The dropdown list in the task form only shows items that are currently in stock.</p>
                </FAQItem>
            </FAQSection>

            <FAQSection title="Financials">
                 <FAQItem question="Why do my debits and credits have to be equal in a journal entry?">
                    <p>This is the core principle of double-entry accounting. Every transaction affects at least two accounts to keep the system in balance. For example, when you buy fertilizer (an Expense), the cash in your bank (an Asset) decreases by the same amount. Ensuring debits equal credits maintains the accuracy of your financial reports, like the Balance Sheet.</p>
                </FAQItem>
                 <FAQItem question="I'm getting an error about missing accounts when I try to run payroll or record a sale. Why?">
                     <p>The system needs specific accounts to automate transactions. Please go to <strong>Financials -&gt; Accounts</strong> and ensure the following exist:</p>
                     <ul>
                        <li>For Sales: An 'Income' account named <code>Crop Sales</code> and an 'Asset' account named <code>Accounts Receivable</code>.</li>
                        <li>For Payroll: An 'Expense' account named <code>Labor Wages</code> and an 'Asset' account named <code>Cash at Bank</code>.</li>
                     </ul>
                </FAQItem>
                <FAQItem question="How can I see my farm's profit or loss?">
                    <p>Navigate to the <strong>Financials</strong> module and select the <strong>Income Statement</strong> report. You can filter by date range, plot, or season to see your performance for a specific period.</p>
                </FAQItem>
            </FAQSection>
            
            <FAQSection title="Inventory & Suppliers">
                <FAQItem question="I'm trying to add an inventory item, but the form won't let me. What am I missing?">
                     <p>You must add at least one supplier before you can add an inventory item. Every item needs to be linked to a supplier for tracking purposes. Go to the <strong>Suppliers</strong> module, add your first supplier, and then you'll be able to add inventory.</p>
                </FAQItem>
                <FAQItem question="How do reorder points work?">
                    <p>A reorder point is a stock level that triggers a reminder. For example, if you set the reorder point for "Maize Seeds" to 10 bags, you will see a "Low Stock" alert on your <strong>Dashboard</strong> as soon as the quantity drops to 10 or below, helping you restock in time.</p>
                </FAQItem>
            </FAQSection>

        </div>
    );
};
