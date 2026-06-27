import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/Loader";

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.order)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;

  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="text-5xl mb-4">✓</div>
      <h1 className="font-display text-3xl mb-2">Order confirmed</h1>
      <p className="text-ink/60 mb-6">
        Order #{id.slice(-6)} — ₹{order?.totalAmount} — {order?.items.length} item(s)
      </p>
      <div className="flex gap-3 justify-center">
        <Link to="/products" className="btn-outline">Continue shopping</Link>
        <Link to="/profile" className="btn-primary">View my orders</Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
