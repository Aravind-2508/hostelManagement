const Placeholder = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-dashed border-gray-300">
        <p className="text-gray-400 text-lg">{title} module coming in Phase 4</p>
    </div>
);

export const ExpenseTracker = () => <Placeholder title="Expense Tracker" />;
export const SupplierManagement = () => <Placeholder title="Supplier Management" />;
