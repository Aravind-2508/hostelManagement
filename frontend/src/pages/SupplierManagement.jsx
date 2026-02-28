import API_URL from '../config/api';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Truck, Phone, Mail, Plus, Building2, MapPin, User } from 'lucide-react';
import { Card, Badge, Button, Modal, Input, Textarea, PageHeader } from '../components/ui/Components';

const SupplierManagement = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', contactPerson: '', address: '' });
    const [loading, setLoading] = useState(true);
    const { admin } = useAuth();
    const { toast } = useToast();

    const fetchSuppliers = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${admin.token}` } };
            const { data } = await axios.get(`${API_URL}/api/suppliers`, config);
            setSuppliers(data);
        } catch {
            toast('Error loading suppliers', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSuppliers(); }, [admin]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${admin.token}` } };
            await axios.post(`${API_URL}/api/suppliers`, formData, config);
            setShowModal(false);
            setFormData({ name: '', phone: '', email: '', contactPerson: '', address: '' });
            fetchSuppliers();
            toast('Supplier added successfully!', 'success');
        } catch {
            toast('Error adding supplier', 'error');
        }
    };

    const avatarBg = ['from-indigo-400 to-violet-500', 'from-emerald-400 to-teal-500',
        'from-amber-400 to-orange-500', 'from-pink-400 to-rose-500', 'from-blue-400 to-cyan-500'];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Supplier Directory"
                subtitle={`${suppliers.length} registered vendors`}
                action={<Button icon={Plus} onClick={() => setShowModal(true)}>Add Supplier</Button>}
            />

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                            <div className="skeleton h-12 w-12 rounded-xl mb-4" />
                            <div className="skeleton h-5 w-3/4 rounded mb-2" />
                            <div className="skeleton h-4 w-1/2 rounded mb-4" />
                            <div className="skeleton h-4 w-full rounded mb-2" />
                            <div className="skeleton h-4 w-full rounded" />
                        </Card>
                    ))}
                </div>
            ) : suppliers.length === 0 ? (
                <Card className="py-16 text-center">
                    <div className="flex flex-col items-center">
                        <div className="p-5 bg-muted rounded-2xl mb-4">
                            <Truck size={36} className="text-muted" />
                        </div>
                        <p className="font-semibold text-base">No suppliers yet</p>
                        <p className="text-sm text-muted mt-1">Add your first supplier to get started</p>
                        <Button icon={Plus} onClick={() => setShowModal(true)} className="mt-4">Add Supplier</Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {suppliers.map((supplier, idx) => (
                        <Card key={supplier._id} hover className="group relative overflow-hidden">
                            {/* Decorative gradient top-right */}
                            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br ${avatarBg[idx % avatarBg.length]} opacity-5 -translate-y-8 translate-x-8 group-hover:opacity-10 transition-all duration-300`} />

                            <div className="flex items-start justify-between mb-5">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarBg[idx % avatarBg.length]} flex items-center justify-center text-white font-black text-lg shadow-md`}>
                                    {supplier.name[0].toUpperCase()}
                                </div>
                                <Badge variant="active">Active Vendor</Badge>
                            </div>

                            <h2 className="text-lg font-bold text-base mb-0.5">{supplier.name}</h2>
                            {supplier.contactPerson && (
                                <div className="flex items-center gap-1.5 text-sub text-sm mb-4">
                                    <User size={13} />
                                    <span>{supplier.contactPerson}</span>
                                </div>
                            )}

                            <div className="space-y-2.5 mb-5">
                                <div className="flex items-center gap-2.5 text-sub">
                                    <div className="p-1.5 rounded-lg bg-muted">
                                        <Phone size={13} />
                                    </div>
                                    <span className="text-sm font-medium">{supplier.phone}</span>
                                </div>
                                {supplier.email && (
                                    <div className="flex items-center gap-2.5 text-sub">
                                        <div className="p-1.5 rounded-lg bg-muted">
                                            <Mail size={13} />
                                        </div>
                                        <span className="text-sm truncate">{supplier.email}</span>
                                    </div>
                                )}
                                {supplier.address && (
                                    <div className="flex items-start gap-2.5 text-sub">
                                        <div className="p-1.5 rounded-lg bg-muted flex-shrink-0 mt-0.5">
                                            <MapPin size={13} />
                                        </div>
                                        <span className="text-xs leading-relaxed">{supplier.address}</span>
                                    </div>
                                )}
                            </div>

                            <button className="w-full py-2.5 bg-muted hover:bg-indigo-50 hover:text-indigo-700 text-sub rounded-xl text-sm font-semibold transition border border-base hover:border-indigo-100">
                                View Supply History →
                            </button>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add Supplier Modal */}
            <Modal open={showModal} onClose={() => setShowModal(false)} title="Register New Supplier">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Vendor Name *"
                        placeholder="Metro Groceries"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Contact Person"
                        placeholder="Ramesh Kumar"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Phone *"
                            placeholder="9876543210"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                        />
                        <Input
                            label="Email"
                            type="email"
                            placeholder="vendor@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <Textarea
                        label="Shop Address"
                        placeholder="123, Market Street, Chennai"
                        rows={2}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
                        <Button type="submit" className="flex-1">Add Vendor</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default SupplierManagement;
