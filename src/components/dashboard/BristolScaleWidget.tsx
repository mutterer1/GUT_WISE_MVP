import { Droplets } from 'lucide-react';
import Card from '../Card';

interface BristolScaleWidgetProps {
  averageScale: number | null;
  count: number;
  loading: boolean;
}

export default function BristolScaleWidget({
  averageScale,
  count,
  loading,
}: BristolScaleWidgetProps) {
  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
        </div>
      </Card>
    );
  }

  const getBristolInfo = (scale: number) => {
    const info = {
      1: { type: 'Type 1', desc: 'Hard lumps', color: 'bg-red-100 text-red-700', status: 'Constipation' },
      2: { type: 'Type 2', desc: 'Lumpy sausage', color: 'bg-orange-100 text-orange-700', status: 'Mild constipation' },
      3: { type: 'Type 3', desc: 'Cracked sausage', color: 'bg-green-100 text-green-700', status: 'Normal' },
      4: { type: 'Type 4', desc: 'Smooth snake', color: 'bg-green-100 text-green-700', status: 'Ideal' },
      5: { type: 'Type 5', desc: 'Soft blobs', color: 'bg-green-100 text-green-700', status: 'Normal' },
      6: { type: 'Type 6', desc: 'Mushy pieces', color: 'bg-yellow-100 text-yellow-700', status: 'Mild diarrhea' },
      7: { type: 'Type 7', desc: 'Liquid', color: 'bg-red-100 text-red-700', status: 'Diarrhea' },
    };

    const rounded = Math.round(scale);
    return info[rounded as keyof typeof info] || info[4];
  };

  if (count === 0 || averageScale === null) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Average Stool Type</p>
            <p className="text-4xl font-bold text-gray-300">--</p>
          </div>
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <Droplets className="h-6 w-6 text-gray-400" />
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            No data logged yet today
          </p>
        </div>
      </Card>
    );
  }

  const bristolInfo = getBristolInfo(averageScale);
  const roundedScale = Math.round(averageScale * 10) / 10;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Average Stool Type</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-gray-900">{roundedScale}</p>
            <p className="text-sm text-gray-600">/ 7</p>
          </div>
        </div>
        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
          <Droplets className="h-6 w-6 text-amber-600" />
        </div>
      </div>

      <div className={`${bristolInfo.color} p-3 rounded-lg mb-3`}>
        <p className="text-sm font-semibold">{bristolInfo.type}</p>
        <p className="text-xs mt-1">{bristolInfo.desc}</p>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-xs font-medium text-gray-700">Status: {bristolInfo.status}</p>
        <p className="text-xs text-gray-600 mt-1">Based on {count} {count === 1 ? 'entry' : 'entries'} today</p>
      </div>

      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Bristol Scale</span>
          <span className="text-xs text-gray-500">1-7</span>
        </div>
        <div className="h-2 bg-gradient-to-r from-red-300 via-green-300 to-red-300 rounded-full relative">
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-gray-900 rounded-full border-2 border-white shadow-lg"
            style={{ left: `${((averageScale - 1) / 6) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">Constipation</span>
          <span className="text-xs text-gray-500">Ideal</span>
          <span className="text-xs text-gray-500">Diarrhea</span>
        </div>
      </div>
    </Card>
  );
}
