import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Loader from "../../components/Loader";

const AdminComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get("/admin/comments").then(({ data }) => setComments(data.comments)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggleHide = async (id) => {
    await api.put(`/admin/comments/${id}/hide`);
    toast.success("Comment updated");
    load();
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Moderate comments</h1>
      <div className="space-y-2">
        {comments.map((c) => (
          <div key={c._id} className={`card p-3 ${c.isHidden ? "opacity-50" : ""}`}>
            <p className="text-sm font-medium">{c.user?.name} on "{c.outfit?.title}"</p>
            <p className="text-sm text-ink/70 mt-1">{c.text}</p>
            <button onClick={() => toggleHide(c._id)} className="text-xs text-moss mt-2 hover:underline">
              {c.isHidden ? "Unhide" : "Hide"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminComments;
