import API_URL from '../config/api';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Calculator, Download, Users, BookOpen, Zap, Package } from 'lucide-react';
import { Card, Button, Badge, PageHeader, SectionHeading } from '../components/ui/Components';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const GroceryCalculator = () => {
    const [students, setStudents] = useState([]);
    const [menu, setMenu] = useState([]);
    const [calculation, setCalculation] = useState([]);
    const [calculating, setCalculating] = useState(false);
    const { admin } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${admin.token}` } };
                const [resStudents, resMenu] = await Promise.all([
                    axios.get(`${API_URL}/api/students`, config),
                    axios.get(`${API_URL}/api/menu`, config)
                ]);
                setStudents(resStudents.data);
                setMenu(resMenu.data);
            } catch {
                toast('Error fetching data', 'error');
            }
        };
        fetchData();
    }, [admin]);

    const calculateTotal = async () => {
        setCalculating(true);
        await new Promise(r => setTimeout(r, 600)); // Smooth delay for UX

        const activeCount = students.filter(s => s.status === 'Active').length;
        const totals = {};
        menu.forEach(meal => {
            meal.ingredients.forEach(ing => {
                const key = `${ing.name}-${ing.unit}`;
                if (!totals[key]) totals[key] = { name: ing.name, total: 0, unit: ing.unit };
                totals[key].total += (ing.quantityPerStudent * activeCount);
            });
        });
        setCalculation(Object.values(totals));
        setCalculating(false);
        toast('Calculation complete!', 'success');
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor(79, 70, 229);
        doc.text('Weekly Grocery Requirements', 14, 20);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Active Students: ${students.filter(s => s.status === 'Active').length} | Menu Items: ${menu.length}`, 14, 30);
        autoTable(doc, {
            startY: 38,
            head: [['#', 'Ingredient', 'Total Quantity', 'Unit']],
            body: calculation.map((item, i) => [i + 1, item.name, item.total.toFixed(2), item.unit]),
            headStyles: { fillColor: [79, 70, 229] },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            styles: { fontSize: 11, cellPadding: 5 },
        });
        doc.save('grocery-requirements.pdf');
        toast('PDF exported!', 'success');
    };

    const activeStudents = students.filter(s => s.status === 'Active').length;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Smart Grocery Calculator"
                subtitle="Auto-calculate weekly ingredient requirements based on active students and menu"
            />

            {/* Hero summary card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Card className="flex flex-col items-center text-center py-8">
                    <div className="p-4 rounded-2xl bg-indigo-100 mb-4">
                        <Users size={28} className="text-indigo-600" />
                    </div>
                    <p className="text-sm text-sub font-medium mb-1">Active Students</p>
                    <p className="text-5xl font-black text-indigo-600">{activeStudents}</p>
                    <p className="text-xs text-muted mt-2">of {students.length} total</p>
                </Card>

                <Card className="flex flex-col items-center text-center py-8">
                    <div className="p-4 rounded-2xl bg-emerald-100 mb-4">
                        <BookOpen size={28} className="text-emerald-600" />
                    </div>
                    <p className="text-sm text-sub font-medium mb-1">Weekly Menu Items</p>
                    <p className="text-5xl font-black text-emerald-600">{menu.length}</p>
                    <p className="text-xs text-muted mt-2">meals with ingredients</p>
                </Card>

                <Card className="flex flex-col items-center justify-center py-8 bg-gradient-to-br from-indigo-600 to-violet-700 border-0 text-white">
                    <div className="p-4 rounded-2xl bg-white/10 mb-4 border border-white/20">
                        <Zap size={28} className="text-white" />
                    </div>
                    <p className="text-sm text-indigo-200 font-medium mb-4">Ready to calculate?</p>
                    <Button
                        onClick={calculateTotal}
                        disabled={calculating}
                        className="!bg-white !text-indigo-700 hover:!bg-indigo-50 !shadow-lg !rounded-xl font-bold px-6"
                    >
                        {calculating ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" /></svg>
                                Calculating...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2"><Calculator size={16} /> Run Calculation</span>
                        )}
                    </Button>
                </Card>
            </div>

            {/* Results table */}
            {calculation.length > 0 && (
                <Card padding={false} className="animate-fadeInUp">
                    <div className="p-5 border-b border-base flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <SectionHeading icon={Package} title="Weekly Ingredient Requirements" />
                            <Badge variant="primary">{calculation.length} items</Badge>
                        </div>
                        <Button icon={Download} variant="outline" onClick={exportPDF} size="sm">
                            Export PDF
                        </Button>
                    </div>

                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-base">
                                {['#', 'Ingredient', 'Total Quantity', 'Unit', 'Status'].map(h => (
                                    <th key={h} className="px-6 py-3.5 text-xs font-semibold text-sub uppercase tracking-wider bg-subtle">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {calculation.map((item, idx) => (
                                <tr key={idx} className="border-t border-subtle table-row-hover transition-colors">
                                    <td className="px-6 py-4 text-sm text-muted font-mono">{String(idx + 1).padStart(2, '0')}</td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-base">{item.name}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-2xl font-black text-indigo-600">{item.total.toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="info">{item.unit}</Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={item.total > 10 ? 'active' : 'warning'}>
                                            {item.total > 10 ? 'Sufficient' : 'Low Volume'}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="p-5 bg-amber-50 border-t border-amber-100 rounded-b-2xl flex items-start gap-2">
                        <span className="text-amber-500 flex-shrink-0 mt-0.5">ℹ️</span>
                        <p className="text-amber-800 text-sm">
                            <strong>Note:</strong> Quantities are calculated as <code>(qty per student × {activeStudents} active students)</code> across all weekly menu entries.
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default GroceryCalculator;
