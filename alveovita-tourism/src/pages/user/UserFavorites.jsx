// pages/user/UserFavorites.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import {
  Heart,
  MapPin,
  Star,
  Loader2,
  Trash2,
  Plane,
  Hotel,
  ArrowRight
} from "lucide-react";

const UserFavorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/favorites");
      setFavorites(res.data);
    } catch (err) {
      console.error("Error fetching favorites:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id) => {
    try {
      await axios.delete(`/favorites/${id}`);
      setFavorites(favorites.filter(f => f._id !== id));
    } catch (err) {
      console.error("Error removing favorite:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">My Favorites</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Your saved destinations and experiences</p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No favorites yet</p>
          <button
            onClick={() => navigate("/tours")}
            className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
          >
            Start exploring →
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((item) => (
            <div
              key={item._id}
              className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center relative">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-400">
                    {item.type === "tour" ? <Plane className="h-12 w-12" /> : <Hotel className="h-12 w-12" />}
                  </div>
                )}
                <button
                  onClick={() => removeFavorite(item._id)}
                  className="absolute top-4 right-4 p-2 bg-red-500/90 backdrop-blur-sm rounded-lg text-white hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{item.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {item.location}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {item.type}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/${item.type}/${item._id}`)}
                  className="mt-4 w-full py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors flex items-center justify-center gap-2"
                >
                  View Details <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserFavorites;