/**
 * RaceWeekendInfo Component
 * Displays comprehensive race weekend information including:
 * - Session schedule (FP1, FP2, FP3, Qualifying, Sprint, Race)
 * - Qualifying results
 * - Sprint results (if applicable)
 * - Race results
 * - Championship standings after race
 */

import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface RaceWeekendInfoProps {
  season: string;
  round: string;
}

type TabType = 'schedule' | 'qualifying' | 'sprint' | 'race' | 'standings';

const RaceWeekendInfo: React.FC<RaceWeekendInfoProps> = ({ season, round }) => {
  const [weekendData, setWeekendData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('race');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getRaceWeekend(season, round);
        setWeekendData(data);
        // Set default tab based on available data
        if (data.race) setActiveTab('race');
        else if (data.sprint) setActiveTab('sprint');
        else if (data.qualifying) setActiveTab('qualifying');
        else setActiveTab('schedule');
      } catch (err) {
        console.error('Error fetching weekend data:', err);
        setError('Failed to load race weekend data');
      } finally {
        setLoading(false);
      }
    };

    if (season && round) {
      fetchData();
    }
  }, [season, round]);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-400">
        {error}
      </div>
    );
  }

  if (!weekendData) return null;

  const tabs: { id: TabType; label: string; available: boolean }[] = [
    { id: 'schedule', label: 'Schedule', available: !!weekendData.info },
    { id: 'qualifying', label: 'Qualifying', available: !!weekendData.qualifying },
    { id: 'sprint', label: 'Sprint', available: !!weekendData.sprint },
    { id: 'race', label: 'Race', available: !!weekendData.race },
    { id: 'standings', label: 'Standings', available: weekendData.standingsAfterRace?.drivers?.length > 0 },
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    return timeStr.replace(':00Z', ' UTC');
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-3 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white">
          {weekendData.info?.raceName || 'Race Weekend'}
        </h3>
        <p className="text-sm text-gray-400">
          {weekendData.info?.circuit?.circuitName} • {weekendData.info?.circuit?.Location?.locality}, {weekendData.info?.circuit?.Location?.country}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 overflow-x-auto">
        {tabs.filter(t => t.available).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors
              ${activeTab === tab.id 
                ? 'text-f1-red border-b-2 border-f1-red bg-gray-700/50' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/30'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {/* Schedule Tab */}
        {activeTab === 'schedule' && weekendData.info && (
          <div className="space-y-3">
            <h4 className="text-white font-bold mb-3">Session Schedule</h4>
            
            {weekendData.info.firstPractice && (
              <SessionRow 
                name="Practice 1" 
                date={formatDate(weekendData.info.firstPractice.date)}
                time={formatTime(weekendData.info.firstPractice.time)}
              />
            )}
            {weekendData.info.secondPractice && (
              <SessionRow 
                name="Practice 2" 
                date={formatDate(weekendData.info.secondPractice.date)}
                time={formatTime(weekendData.info.secondPractice.time)}
              />
            )}
            {weekendData.info.thirdPractice && (
              <SessionRow 
                name="Practice 3" 
                date={formatDate(weekendData.info.thirdPractice.date)}
                time={formatTime(weekendData.info.thirdPractice.time)}
              />
            )}
            {weekendData.info.sprint && (
              <SessionRow 
                name="Sprint" 
                date={formatDate(weekendData.info.sprint.date)}
                time={formatTime(weekendData.info.sprint.time)}
                highlight
              />
            )}
            {weekendData.info.qualifying && (
              <SessionRow 
                name="Qualifying" 
                date={formatDate(weekendData.info.qualifying.date)}
                time={formatTime(weekendData.info.qualifying.time)}
              />
            )}
            <SessionRow 
              name="Race" 
              date={formatDate(weekendData.info.date)}
              time={formatTime(weekendData.info.time)}
              highlight
            />
          </div>
        )}

        {/* Qualifying Tab */}
        {activeTab === 'qualifying' && weekendData.qualifying && (
          <div>
            <h4 className="text-white font-bold mb-3">Qualifying Results</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-left border-b border-gray-700">
                    <th className="pb-2 pr-2">Pos</th>
                    <th className="pb-2 pr-2">Driver</th>
                    <th className="pb-2 pr-2">Team</th>
                    <th className="pb-2 pr-2">Q1</th>
                    <th className="pb-2 pr-2">Q2</th>
                    <th className="pb-2">Q3</th>
                  </tr>
                </thead>
                <tbody>
                  {weekendData.qualifying.results?.map((result: any) => (
                    <tr key={result.driverCode} className="border-b border-gray-700/50">
                      <td className={`py-2 pr-2 font-bold ${result.position <= 3 ? 'text-yellow-400' : 'text-white'}`}>
                        {result.position}
                      </td>
                      <td className="py-2 pr-2 text-white font-medium">{result.driverCode}</td>
                      <td className="py-2 pr-2 text-gray-400">{result.constructor}</td>
                      <td className="py-2 pr-2 text-gray-300 font-mono text-xs">{result.q1 || '-'}</td>
                      <td className="py-2 pr-2 text-gray-300 font-mono text-xs">{result.q2 || '-'}</td>
                      <td className={`py-2 font-mono text-xs ${result.position === 1 ? 'text-purple-400 font-bold' : 'text-gray-300'}`}>
                        {result.q3 || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sprint Tab */}
        {activeTab === 'sprint' && weekendData.sprint && (
          <div>
            <h4 className="text-white font-bold mb-3">Sprint Results</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-left border-b border-gray-700">
                    <th className="pb-2 pr-2">Pos</th>
                    <th className="pb-2 pr-2">Driver</th>
                    <th className="pb-2 pr-2">Team</th>
                    <th className="pb-2 pr-2">Grid</th>
                    <th className="pb-2 pr-2">Time</th>
                    <th className="pb-2">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {weekendData.sprint.results?.map((result: any) => (
                    <tr key={result.driverCode} className="border-b border-gray-700/50">
                      <td className={`py-2 pr-2 font-bold ${result.position <= 3 ? 'text-yellow-400' : 'text-white'}`}>
                        {result.position}
                      </td>
                      <td className="py-2 pr-2 text-white font-medium">{result.driverCode}</td>
                      <td className="py-2 pr-2 text-gray-400">{result.constructor}</td>
                      <td className="py-2 pr-2 text-gray-300">{result.grid}</td>
                      <td className="py-2 pr-2 text-gray-300 font-mono text-xs">{result.time || result.status}</td>
                      <td className="py-2 text-green-400 font-bold">{result.points > 0 ? `+${result.points}` : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Race Tab */}
        {activeTab === 'race' && weekendData.race && (
          <div>
            <h4 className="text-white font-bold mb-3">Race Results</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-left border-b border-gray-700">
                    <th className="pb-2 pr-2">Pos</th>
                    <th className="pb-2 pr-2">Driver</th>
                    <th className="pb-2 pr-2">Team</th>
                    <th className="pb-2 pr-2">Grid</th>
                    <th className="pb-2 pr-2">Laps</th>
                    <th className="pb-2 pr-2">Time/Status</th>
                    <th className="pb-2">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {weekendData.race.results?.map((result: any) => (
                    <tr key={result.driverCode} className="border-b border-gray-700/50">
                      <td className={`py-2 pr-2 font-bold ${
                        result.position === 1 ? 'text-yellow-400' :
                        result.position === 2 ? 'text-gray-300' :
                        result.position === 3 ? 'text-amber-600' : 'text-white'
                      }`}>
                        {result.positionText}
                      </td>
                      <td className="py-2 pr-2">
                        <span className="text-white font-medium">{result.driverCode}</span>
                        {result.fastestLap?.rank === 1 && (
                          <span className="ml-1 text-purple-400 text-xs">⏱</span>
                        )}
                      </td>
                      <td className="py-2 pr-2 text-gray-400">{result.constructor}</td>
                      <td className="py-2 pr-2 text-gray-300">{result.grid}</td>
                      <td className="py-2 pr-2 text-gray-300">{result.laps}</td>
                      <td className={`py-2 pr-2 font-mono text-xs ${
                        result.status !== 'Finished' && !result.time ? 'text-red-400' : 'text-gray-300'
                      }`}>
                        {result.time || result.status}
                      </td>
                      <td className="py-2 text-green-400 font-bold">{result.points > 0 ? `+${result.points}` : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Standings Tab */}
        {activeTab === 'standings' && weekendData.standingsAfterRace && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Driver Standings */}
            <div>
              <h4 className="text-white font-bold mb-3">Driver Standings</h4>
              <div className="space-y-1">
                {weekendData.standingsAfterRace.drivers?.map((driver: any) => (
                  <div 
                    key={driver.driverCode}
                    className="flex items-center justify-between py-2 px-3 bg-gray-700/30 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-bold w-6 ${driver.position <= 3 ? 'text-yellow-400' : 'text-white'}`}>
                        {driver.position}
                      </span>
                      <span className="text-white font-medium">{driver.driverCode}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400 text-sm">{driver.wins} wins</span>
                      <span className="text-white font-bold">{driver.points} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Constructor Standings */}
            <div>
              <h4 className="text-white font-bold mb-3">Constructor Standings</h4>
              <div className="space-y-1">
                {weekendData.standingsAfterRace.constructors?.map((team: any) => (
                  <div 
                    key={team.name}
                    className="flex items-center justify-between py-2 px-3 bg-gray-700/30 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-bold w-6 ${team.position <= 3 ? 'text-yellow-400' : 'text-white'}`}>
                        {team.position}
                      </span>
                      <span className="text-white font-medium">{team.name}</span>
                    </div>
                    <span className="text-white font-bold">{team.points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pit Stops Summary */}
      {weekendData.pitStops?.length > 0 && activeTab === 'race' && (
        <div className="px-4 pb-4">
          <div className="border-t border-gray-700 pt-3">
            <h4 className="text-white font-bold mb-2 text-sm">Pit Stops ({weekendData.pitStops.length})</h4>
            <div className="flex flex-wrap gap-2">
              {weekendData.pitStops.slice(0, 10).map((ps: any, i: number) => (
                <span key={i} className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                  {ps.driverId} L{ps.lap} ({ps.duration}s)
                </span>
              ))}
              {weekendData.pitStops.length > 10 && (
                <span className="text-xs text-gray-500">+{weekendData.pitStops.length - 10} more</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for session schedule rows
const SessionRow: React.FC<{ name: string; date: string; time: string; highlight?: boolean }> = ({
  name, date, time, highlight
}) => (
  <div className={`flex items-center justify-between py-2 px-3 rounded ${
    highlight ? 'bg-f1-red/20 border border-f1-red/50' : 'bg-gray-700/30'
  }`}>
    <span className={`font-medium ${highlight ? 'text-f1-red' : 'text-white'}`}>{name}</span>
    <div className="text-right">
      <span className="text-gray-300">{date}</span>
      <span className="text-gray-500 ml-2">{time}</span>
    </div>
  </div>
);

export default RaceWeekendInfo;
