import { useState } from 'react';
import axios from 'axios';

export default function AdminStats() {
  const [stats, setStats] = useState({
    registrations: null,
    bookings: null
  });
  const [loading, setLoading] = useState(false);

  const fetchStats = async (type: 'registrations' | 'bookings') => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/admin/stats/${type}`);
      setStats(prev => ({
        ...prev,
        [type]: response.data
      }));
    } catch (error) {
      console.error(`Error fetching ${type} stats:`, error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-[24px] shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Статистика</h2>
      
      <div className="space-y-4">
        <div>
          <button
            onClick={() => fetchStats('registrations')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            disabled={loading}
          >
            {loading ? 'Загрузка...' : 'Статистика регистраций'}
          </button>
          {stats.registrations && (
            <div className="mt-2 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Статистика регистраций:</h3>
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(stats.registrations, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => fetchStats('bookings')}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            disabled={loading}
          >
            {loading ? 'Загрузка...' : 'Статистика бронирований'}
          </button>
          {stats.bookings && (
            <div className="mt-2 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Статистика бронирований:</h3>
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(stats.bookings, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 