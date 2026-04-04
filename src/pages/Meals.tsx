import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { UtensilsCrossed, Plus, Calendar } from 'lucide-react';
import { useMealStatistics } from '../hooks/useMealStatistics';

export default function Meals() {
  const navigate = useNavigate();
  const { statistics } = useMealStatistics();

  return (
    <div className="flex min-h-screen bg-neutral-bg">
      <Header />
      <Sidebar />

      <main className="flex-1 lg:ml-64 pt-32 lg:pt-0 p-md sm:p-lg lg:p-lg">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Meal Tracking</h1>
              <p className="text-gray-600">Log and analyze your daily food intake</p>
            </div>
            <Button onClick={() => navigate('/food-log')} className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Log Meal
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Today's Meals</p>
                <p className="text-3xl font-bold text-gray-900">{statistics.todayMealCount}</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Calories</p>
                <p className="text-3xl font-bold text-gray-900">{statistics.totalCalories}</p>
              </div>
            </Card>
          </div>

          <Card className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-6 w-6 text-teal-600" />
              <h2 className="text-xl font-semibold text-gray-900">Today's Log</h2>
            </div>
            <div className="space-y-4">
              {['Breakfast', 'Lunch', 'Dinner'].map((meal) => (
                <div key={meal} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UtensilsCrossed className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{meal}</p>
                        <p className="text-sm text-gray-500">Tap to add meals</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/food-log?meal=${meal.toLowerCase()}`)}>Add</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
