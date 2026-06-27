import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Loader from "../../components/Loader";

const ROLES = ["customer", "seller", "stylist", "admin"];

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get("/admin/users").then(({ data }) => setUsers(data.users)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const changeRole = async (id, role) => {
    await api.put(`/admin/users/${id}/role`, { role });
    toast.success("Role updated");
    load();
  };

  const removeUser = async (id) => {
    if (!window.confirm("Remove this user?")) return;
    await api.delete(`/admin/users/${id}`);
    toast.success("User removed");
    load();
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Manage users</h1>
      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="card p-3 flex items-center gap-4">
            <div className="flex-1">
              <p className="font-medium">{u.name}</p>
              <p className="text-sm text-ink/50">{u.email}</p>
            </div>
            <select
              className="input w-32"
              value={u.role}
              onChange={(e) => changeRole(u.id, e.target.value)}
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <button onClick={() => removeUser(u.id)} className="text-clay text-sm">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;
