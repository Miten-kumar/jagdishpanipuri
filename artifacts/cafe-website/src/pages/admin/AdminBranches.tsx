import { useState } from "react";
import { MapPin, Plus, Edit2, Trash2, X, Phone, Mail, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Branch { id: number; name: string; address: string; phone: string; email: string; openingHours: string; mapUrl: string; sortOrder: number; }

function BranchFormModal({ branch, onClose, onSaved }: { branch?: Branch | null; onClose: () => void; onSaved: () => void }) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: branch?.name ?? "", address: branch?.address ?? "", phone: branch?.phone ?? "+91", email: branch?.email ?? "", openingHours: branch?.openingHours ?? "", mapUrl: branch?.mapUrl ?? "", sortOrder: branch?.sortOrder ?? 0 });
  const [phoneError, setPhoneError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast({ title: "Branch name is required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const url = branch ? `${BASE}/api/branches/${branch.id}` : `${BASE}/api/branches`;
      const res = await fetch(url, { method: branch ? "PUT" : "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Failed");
      toast({ title: branch ? "Branch updated" : "Branch added" });
      onSaved();
    } catch { toast({ title: "Error saving branch", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-bold text-foreground">{branch ? "Edit Branch" : "Add Branch"}</h3>
          <button onClick={onClose}><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSave} className="p-4 space-y-3">
          <div className="space-y-1"><Label>Branch Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Downtown Branch" required /></div>
          <div className="space-y-1"><Label>Address</Label><Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full address" rows={2} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 0000" /></div>
            <div className="space-y-1"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="branch@email.com" /></div>
          </div>
          <div className="space-y-1"><Label>Opening Hours</Label><Input value={form.openingHours} onChange={(e) => setForm({ ...form, openingHours: e.target.value })} placeholder="Mon-Sun: 8:00 AM - 10:00 PM" /></div>
          <div className="space-y-1"><Label>Google Maps URL</Label><Input value={form.mapUrl} onChange={(e) => setForm({ ...form, mapUrl: e.target.value })} placeholder="https://maps.google.com/..." /></div>
          <div className="space-y-1"><Label>Sort Order</Label><Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} /></div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1" disabled={saving}>{saving ? "Saving..." : "Save Branch"}</Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminBranches() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editBranch, setEditBranch] = useState<Branch | null | undefined>(undefined);

  const { data: branches, isLoading } = useQuery<Branch[]>({
    queryKey: ["branches"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/branches`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await fetch(`${BASE}/api/branches/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["branches"] }); toast({ title: "Branch deleted" }); },
    onError: () => toast({ title: "Failed to delete branch", variant: "destructive" }),
  });

  return (
    <div>
      {editBranch !== undefined && (
        <BranchFormModal
          branch={editBranch}
          onClose={() => setEditBranch(undefined)}
          onSaved={() => { queryClient.invalidateQueries({ queryKey: ["branches"] }); setEditBranch(undefined); }}
        />
      )}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Branch Locations</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your restaurant branches. These appear on the Contact page.</p>
        </div>
        <Button onClick={() => setEditBranch(null)} className="gap-2 shrink-0"><Plus className="w-4 h-4" />Add Branch</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading branches...</div>
      ) : !branches?.length ? (
        <div className="text-center py-20 text-muted-foreground">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="mb-2">No branches added yet.</p>
          <p className="text-sm">Add branches to display multiple locations on your Contact page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {branches.map((branch, i) => (
            <motion.div key={branch.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <h3 className="font-bold text-foreground">{branch.name}</h3>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => setEditBranch(branch)}><Edit2 className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { if (confirm(`Delete "${branch.name}"?`)) deleteMutation.mutate(branch.id); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    {branch.address && <div className="flex gap-2 text-muted-foreground"><MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{branch.address}</span></div>}
                    {branch.phone && <div className="flex gap-2 text-muted-foreground"><Phone className="w-3.5 h-3.5 shrink-0" /><span>{branch.phone}</span></div>}
                    {branch.email && <div className="flex gap-2 text-muted-foreground"><Mail className="w-3.5 h-3.5 shrink-0" /><span>{branch.email}</span></div>}
                    {branch.openingHours && <div className="flex gap-2 text-muted-foreground"><Clock className="w-3.5 h-3.5 shrink-0" /><span>{branch.openingHours}</span></div>}
                    {branch.mapUrl && <a href={branch.mapUrl} target="_blank" rel="noreferrer" className="text-primary text-xs hover:underline flex gap-1.5 items-center mt-1"><MapPin className="w-3 h-3" />View on Maps</a>}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
