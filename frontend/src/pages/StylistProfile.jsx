import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import OutfitCard from "../components/OutfitCard";
import Loader from "../components/Loader";

const StylistProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [stylist, setStylist] = useState(null);
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followBusy, setFollowBusy] = useState(false);

  useEffect(() => {
    api
      .get(`/social/stylists/${id}`)
      .then(({ data }) => {
        setStylist(data.stylist);
        setOutfits(data.outfits);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleFollow = async () => {
    if (!user) return toast.error("Log in to follow stylists");
    if (followBusy) return;
    setFollowBusy(true);

    // optimistic toggle
    const wasFollowing = stylist.isFollowing;
    setStylist((s) => ({
      ...s,
      isFollowing: !wasFollowing,
      followersCount: wasFollowing ? s.followersCount - 1 : s.followersCount + 1,
    }));

    try {
      const { data } = await api.post(`/social/follow/${id}`);
      setStylist((s) => ({ ...s, isFollowing: data.following }));
      toast.success(data.following ? `Following ${stylist.name}` : `Unfollowed ${stylist.name}`);
    } catch (err) {
      // roll back
      setStylist((s) => ({
        ...s,
        isFollowing: wasFollowing,
        followersCount: wasFollowing ? s.followersCount + 1 : s.followersCount - 1,
      }));
      toast.error(err.response?.data?.message || "Couldn't update follow status");
    } finally {
      setFollowBusy(false);
    }
  };

  if (loading) return <Loader />;
  if (!stylist) return <p className="text-center py-10 text-ink/50">Stylist not found.</p>;

  const isSelf = user && String(user._id) === String(stylist.id);

  return (
    <div>
      {/* Profile header — banner + avatar, social-profile style */}
      <div className="rounded-3xl bg-gradient-to-br from-moss/20 via-sand to-clay/10 p-6 md:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <span className="w-20 h-20 rounded-full bg-moss text-white flex items-center justify-center text-3xl font-semibold shadow-lg shrink-0">
            {stylist.avatar ? (
              <img src={stylist.avatar} alt={stylist.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              stylist.name?.[0]?.toUpperCase()
            )}
          </span>

          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl md:text-3xl">{stylist.name}</h1>
            {stylist.bio && <p className="text-ink/70 text-sm mt-1 max-w-md">{stylist.bio}</p>}

            <div className="flex items-center gap-4 mt-3 text-sm">
              <span><strong>{stylist.followersCount}</strong> <span className="text-ink/60">followers</span></span>
              <span><strong>{stylist.outfitsCount}</strong> <span className="text-ink/60">outfits</span></span>
            </div>

            {stylist.specialties?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {stylist.specialties.map((s) => (
                  <span key={s} className="text-xs bg-white/70 px-2.5 py-1 rounded-full text-ink/70">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {!isSelf && (
            <button
              onClick={handleFollow}
              disabled={followBusy}
              className={`follow-btn ${stylist.isFollowing ? "is-following" : ""} self-start sm:self-center !text-sm !px-5 !py-2.5`}
            >
              {stylist.isFollowing ? "✓ Following" : "+ Follow"}
            </button>
          )}
        </div>
      </div>

      <h2 className="font-display text-xl mb-4">Looks by {stylist.name}</h2>

      {outfits.length === 0 ? (
        <p className="text-ink/50 py-10 text-center">No published outfits yet.</p>
      ) : (
        <div className="masonry">
          {outfits.map((o) => (
            <div className="masonry-item" key={o._id}>
              <OutfitCard outfit={{ ...o, stylist: { _id: stylist.id, name: stylist.name } }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StylistProfile;
