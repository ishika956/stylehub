import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get("/notifications").then(({ data }) => setNotifications(data.notifications)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const markAllRead = async () => {
    await api.put("/notifications/read-all");
    load();
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl">Notifications</h1>
        <button onClick={markAllRead} className="text-sm text-moss hover:underline">
          Mark all as read
        </button>
      </div>

      {notifications.length === 0 ? (
        <p className="text-ink/50">You're all caught up.</p>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n._id} className={`card p-3 text-sm ${n.isRead ? "opacity-60" : ""}`}>
              <p>{n.message}</p>
              <p className="text-xs text-ink/40 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
