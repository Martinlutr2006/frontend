import React, { useState, useEffect } from 'react';
import api from '../api';

function Report() {
  const [dailyReport, setDailyReport] = useState(null);
  const [weeklyReport, setWeeklyReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    date: new Date().toISOString().split('T')[0],
    start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  const fetchDailyReport = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reports/daily?date=${dateRange.date}`);
      setDailyReport(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch daily report');
      setLoading(false);
      console.error('Error fetching daily report:', err);
    }
  };

  const fetchWeeklyReport = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/reports/weekly?start_date=${dateRange.start_date}&end_date=${dateRange.end_date}`
      );
      setWeeklyReport(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch weekly report');
      setLoading(false);
      console.error('Error fetching weekly report:', err);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    fetchDailyReport();
    fetchWeeklyReport();
  }, [dateRange.date, dateRange.start_date, dateRange.end_date]);

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Daily Report */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900">Daily Report</h3>
          <div className="mt-4">
            <input
              type="date"
              name="date"
              value={dateRange.date}
              onChange={handleDateChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          {dailyReport && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800">Total Services</h4>
                <p className="mt-1 text-2xl font-semibold text-blue-900">{dailyReport.total_services}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-green-800">Total Revenue</h4>
                <p className="mt-1 text-2xl font-semibold text-green-900">
                  {dailyReport.total_revenue?.toLocaleString() || 0} RWF
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-800">Unpaid Services</h4>
                <p className="mt-1 text-2xl font-semibold text-yellow-900">{dailyReport.unpaid_services}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Report */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900">Weekly Report</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                id="start_date"
                value={dateRange.start_date}
                onChange={handleDateChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                id="end_date"
                value={dateRange.end_date}
                onChange={handleDateChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
          {weeklyReport.length > 0 && (
            <div className="mt-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Services
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unpaid Services
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {weeklyReport.map((report) => (
                      <tr key={report.date}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(report.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.total_services}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.total_revenue?.toLocaleString() || 0} RWF
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.unpaid_services}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Report;
