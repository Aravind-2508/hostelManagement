import API_URL from '../config/api';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Calendar, Save, Plus, Trash2, Utensils, CheckCircle2 } from 'lucide-react';
import { Card, Button, Input, Select, PageHeader, SectionHeading, Badge } from '../components/ui/Components';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const meals = ['Breakfast', 'Lunch', 'Dinner'];

const dayAbbr = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' };
const mealIcons = { Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙' };
const mealColors = {
    Breakfast: 'from-amber-50 border-amber-200 text-amber-700',
    Lunch: 'from-emerald-50 border-emerald-200 text-emerald-700',
    Dinner: 'from-indigo-50 border-indigo-200 text-indigo-700',
};

const MenuManagement = () => {
    const [menu, setMenu] = useState([]);
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [selectedMeal, setSelectedMeal] = useState('Lunch');
    const [foodItems, setFoodItems] = useState('');
    const [ingredients, setIngredients] = useState([]);
    const [saving, setSaving] = useState(false);
    const { admin } = useAuth();
    const { toast } = useToast();

    const fetchMenu = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${admin.token}` } };
            const { data } = await axios.get(`${API_URL}/api/menu`, config);
            setMenu(data);
            const current = data.find(m => m.day === selectedDay && m.mealType === selectedMeal);
            setFoodItems(current ? current.foodItems : '');
            setIngredients(current ? current.ingredients : []);
        } catch {
            toast('Error loading menu', 'error');
        }
    };

    useEffect(() => { fetchMenu(); }, [selectedDay, selectedMeal, admin]);

    const addIngredient = () => {
        setIngredients([...ingredients, { name: '', quantityPerStudent: 0, unit: 'kg' }]);
    };

    const updateIngredient = (idx, field, value) => {
        const newIngs = [...ingredients];
        newIngs[idx][field] = value;
        setIngredients(newIngs);
    };

    const removeIngredient = (idx) => {
        setIngredients(ingredients.filter((_, i) => i !== idx));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const config = { headers: { Authorization: `Bearer ${admin.token}` } };
            await axios.post(`${API_URL}/api/menu`, {
                day: selectedDay, mealType: selectedMeal, foodItems, ingredients
            }, config);
            toast(`${selectedDay} ${selectedMeal} saved successfully!`, 'success');
        } catch {
            toast('Error saving menu', 'error');
        } finally {
            setSaving(false);
        }
    };

    const hasCurrentMenu = (day, meal) =>
        menu.some(m => m.day === day && m.mealType === meal && m.foodItems);

    const totalQty = ingredients.reduce((acc, ing) => acc + Number(ing.quantityPerStudent || 0), 0);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Menu Planner & Ingredients"
                subtitle="Plan weekly meals and define ingredient quantities per student"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Day + Meal selector */}
                <Card className="lg:col-span-1">
                    <SectionHeading icon={Calendar} title="Select Day" />

                    <div className="space-y-1 mb-6">
                        {days.map(day => {
                            const active = selectedDay === day;
                            const hasMeals = meals.filter(m => hasCurrentMenu(day, m)).length;
                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDay(day)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${active
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                        : 'text-sub hover:bg-subtle hover:text-base'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-bold w-8 ${active ? 'text-indigo-200' : 'text-muted'}`}>
                                            {dayAbbr[day]}
                                        </span>
                                        <span>{day}</span>
                                    </div>
                                    {hasMeals > 0 && (
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${active ? 'bg-indigo-500 text-indigo-100' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {hasMeals}/{meals.length}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="pt-4 border-t border-base">
                        <p className="text-xs font-semibold text-sub uppercase tracking-wider mb-3">Meal Type</p>
                        <div className="grid grid-cols-3 gap-2">
                            {meals.map(meal => (
                                <button
                                    key={meal}
                                    onClick={() => setSelectedMeal(meal)}
                                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-semibold border transition-all ${selectedMeal === meal
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                        : 'border-base text-sub hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50'
                                        }`}
                                >
                                    <span className="text-lg">{mealIcons[meal]}</span>
                                    {meal}
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Editor */}
                <Card className="lg:col-span-2">
                    {/* Header */}
                    <div className={`flex items-center justify-between mb-6 p-4 rounded-xl bg-gradient-to-r border ${mealColors[selectedMeal]} to-white`}>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{mealIcons[selectedMeal]}</span>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{selectedMeal}</p>
                                <p className="font-bold text-base">{selectedDay}</p>
                            </div>
                        </div>
                        <Button
                            icon={saving ? undefined : Save}
                            onClick={handleSave}
                            disabled={saving}
                            variant="success"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>

                    {/* Food items input */}
                    <div className="mb-6">
                        <Input
                            label="Food Items (comma separated)"
                            value={foodItems}
                            onChange={(e) => setFoodItems(e.target.value)}
                            placeholder="e.g. Rice, Dal, Chicken Curry, Roti"
                        />
                        {foodItems && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {foodItems.split(',').map((item, i) => item.trim() && (
                                    <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100">
                                        {item.trim()}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Ingredients */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Utensils size={16} className="text-sub" />
                                <h3 className="font-semibold text-base text-sm">Ingredient Logic (Per Student)</h3>
                                {ingredients.length > 0 && (
                                    <Badge variant="primary">{ingredients.length} items</Badge>
                                )}
                            </div>
                            <Button variant="ghost" size="sm" icon={Plus} onClick={addIngredient}>
                                Add Ingredient
                            </Button>
                        </div>

                        {ingredients.length === 0 ? (
                            <div className="border-2 border-dashed border-base rounded-xl py-8 text-center">
                                <p className="text-sm text-muted">No ingredients yet.</p>
                                <button onClick={addIngredient} className="text-indigo-600 text-sm font-semibold mt-1 hover:underline">
                                    + Add your first ingredient
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-12 gap-2 px-2 mb-2">
                                    <span className="col-span-5 text-xs font-semibold text-muted uppercase">Ingredient</span>
                                    <span className="col-span-3 text-xs font-semibold text-muted uppercase">Qty/Student</span>
                                    <span className="col-span-3 text-xs font-semibold text-muted uppercase">Unit</span>
                                </div>
                                <div className="space-y-2">
                                    {ingredients.map((ing, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-2 items-center p-3 rounded-xl bg-subtle border border-base group hover:border-indigo-100 hover:bg-indigo-50/30 transition">
                                            <input
                                                placeholder="Rice"
                                                className="col-span-5 input-premium text-sm py-2"
                                                value={ing.name}
                                                onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                                            />
                                            <input
                                                type="number" step="0.01" min="0"
                                                placeholder="0.25"
                                                className="col-span-3 input-premium text-sm py-2"
                                                value={ing.quantityPerStudent}
                                                onChange={(e) => updateIngredient(idx, 'quantityPerStudent', e.target.value)}
                                            />
                                            <select
                                                className="col-span-3 input-premium text-sm py-2"
                                                value={ing.unit}
                                                onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                                            >
                                                <option>kg</option>
                                                <option>ltr</option>
                                                <option>pcs</option>
                                                <option>gm</option>
                                            </select>
                                            <button
                                                onClick={() => removeIngredient(idx)}
                                                className="col-span-1 flex items-center justify-center text-muted hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl border border-indigo-100 flex items-center justify-between">
                                    <span className="text-sm text-indigo-700 font-medium">Total per student (all items)</span>
                                    <span className="text-indigo-800 font-bold">{totalQty.toFixed(2)} mixed units</span>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default MenuManagement;
