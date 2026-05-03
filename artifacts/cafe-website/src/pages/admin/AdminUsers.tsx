import { useState } from "react";
import { Users, Plus, Edit2, Trash2, X, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPath } from "@/lib/api-base";

interface AdminUser { id: number; username: string; role: string; createdAt: string; }

function UserFormModal({ user, onClose, onSaved }: { user?: AdminUser | null; onClose: () => void; onSaved: () => void }) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ username: user?.username ?? "", password: "", role: user?.role ?? "admin" });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || (!user && !form.password)) { toast({ title: "Username and password are required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const url = user ? apiPath(`/api/admin-users/${user.id}`) : apiPath("/api/admin-users");
      const body: Record<string, string> = { username: form.username, role: form.role };
      if (form.password) body.password = form.password;
      const res = await fetch(url, { method: user ? "PUT" : "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      if (res.status === 409) { toast({ title: "Username already exists", variant: "destructive" }); setSaving(false); return; }
      if (!res.ok) throw new Error("Failed");
      toast({ title: user ? "User updated" : "User created" });
      onSaved();
    } catch { toast({ title: "Error saving user", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl max-w-sm w-full">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-bold text-foreground">{user ? "Edit User" : "Create User"}</h3>
          <button onClick={onClose}><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSave} className="p-4 space-y-3">
          <div className="space-y-1"><Label>Username / Email *</Label><Input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="user@example.com" required /></div>
          <div className="space-y-1"><Label>{user ? "New Password (leave blank to keep)" : "Password *"}</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" /></div>
          <div className="space-y-1">
            <Label>Role</Label>
            <select className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1" disabled={saving}>{saving ? "Saving..." : "Save User"}</Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const { token, user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editUser, setEditUser] = useState<AdminUser | null | undefined>(undefined);

  const { data: users, isLoading } = useQuery<AdminUser[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch(apiPath("/api/admin-users"), { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await fetch(apiPath(`/api/admin-users/${id}`), { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-users"] }); toast({ title: "User deleted" }); },
    onError: () => toast({ title: "Failed to delete user", variant: "destructive" }),
  });

  return (
    <div>
      {editUser !== undefined && (
        <UserFormModal
          user={editUser}
          onClose={() => setEditUser(undefined)}
          onSaved={() => { queryClient.invalidateQueries({ queryKey: ["admin-users"] }); setEditUser(undefined); }}
        />
      )}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Users</h1>
          <p className="text-muted-foreground text-sm mt-1">Create and manage admin panel users.</p>
        </div>
        <Button onClick={() => setEditUser(null)} className="gap-2 shrink-0"><Plus className="w-4 h-4" />New User</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading users...</div>
      ) : !users?.length ? (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No users yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u, i) => (
            <motion.div key={u.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground text-sm">{u.username}</p>
                        {currentUser?.username === u.username && <Badge variant="secondary" className="text-xs">You</Badge>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-xs capitalize">{u.role}</Badge>
                        <span className="text-xs text-muted-foreground">Joined {new Date(u.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => setEditUser(u)}><Edit2 className="w-3.5 h-3.5" /></Button>
                    {currentUser?.username !== u.username && (
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { if (confirm(`Delete user ${u.username}?`)) deleteMutation.mutate(u.id); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-muted/50 rounded-xl">
        <p className="text-xs text-muted-foreground">
          <strong>Security note:</strong> All passwords are stored encrypted using bcrypt (12 rounds). Never share admin credentials.
        </p>
      </div>
    </div>
  );
}
