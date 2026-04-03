import { Sun, Moon, Utensils, Activity } from 'lucide-react';
import Card from '../Card';

interface TodaySummaryWidgetProps {
  bmCount: number;
  mealsCount: number;
  snacksCount: number;
  hydrationMl: number;
  sleepHours: number | null;
  loading: boolean;
  userName?: string; // Added: User's name to display in greeting
}

export default function TodaySummaryWidget({
  bmCount,
  mealsCount,
  snacksCount,
  hydrationMl,
  sleepHours,
  loading,
  userName, // Added: Destructure userName prop
}: TodaySummaryWidgetProps) {
  const totalFood = mealsCount + snacksCount;
  const hydrationLiters = (hydrationMl / 1000).toFixed(1);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', icon: Sun };
    if (hour < 18) return { text: 'Good Afternoon', icon: Sun };
    return { text: 'Good Evening', icon: Moon };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-teal-50 to-blue-50 border-teal-100">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GreetingIcon className="h-6 w-6 text-teal-600" />
            {/* Display greeting with user's name if available */}
            {greeting.text}{userName ? `, ${userName}` : ''}
          </h2>
          <p className="text-sm text-gray-600 mt-1">Here's your health snapshot for today</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <Activity className="h-6 w-6 mx-auto mb-2 text-teal-600" />
          <p className="text-2xl font-bold text-gray-900">{bmCount}</p>
          <p className="text-xs text-gray-600 mt-1">BM Today</p>
        </div>

        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <Utensils className="h-6 w-6 mx-auto mb-2 text-orange-600" />
          <p className="text-2xl font-bold text-gray-900">{totalFood}</p>
          <p className="text-xs text-gray-600 mt-1">
            {mealsCount} meals, {snacksCount} snacks
          </p>
        </div>

        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <svg className="h-6 w-6 mx-auto mb-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p className="text-2xl font-bold text-gray-900">{hydrationLiters}L</p>
          <p className="text-xs text-gray-600 mt-1">Water Intake</p>
        </div>

        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <Moon className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
          <p className="text-2xl font-bold text-gray-900">
            {sleepHours !== null ? `${sleepHours}h` : '--'}
          </p>
          <p className="text-xs text-gray-600 mt-1">Last Sleep</p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-teal-100 rounded-lg">
        <p className="text-sm text-teal-900 text-center">
          {bmCount > 0
            ? "Great job tracking your health today!"
            : "Start logging your health activities to see insights here"}
        </p>
      </div>
    </Card>
  );
}
