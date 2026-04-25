import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import GlobalSaveNotification from './components/GlobalSaveNotification';
import { useSaveEventHandler } from './hooks/useSaveEventHandler';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DailyCheckIn from './pages/DailyCheckIn';
import Dashboard from './pages/Dashboard';
import Insights from './pages/Insights';
import Meals from './pages/Meals';
import BMLog from './pages/BMLog';
import FoodLog from './pages/FoodLog';
import SymptomsLog from './pages/SymptomsLog';
import SleepLog from './pages/SleepLog';
import StressLog from './pages/StressLog';
import HydrationLog from './pages/HydrationLog';
import MedicationLog from './pages/MedicationLog';
import MenstrualCycleLog from './pages/MenstrualCycleLog';
import ExerciseLog from './pages/ExerciseLog';
import Reports from './pages/Reports';
import Trends from './pages/Trends';
import Settings from './pages/Settings';
import Account from './pages/Account';
import Privacy from './pages/Privacy';
import Disclaimer from './pages/Disclaimer';
import ProfileSettings from './pages/settings/ProfileSettings';
import NotificationsSettings from './pages/settings/NotificationsSettings';
import PrivacySecuritySettings from './pages/settings/PrivacySecuritySettings';
import BillingSettings from './pages/settings/BillingSettings';
import DataManagementSettings from './pages/settings/DataManagementSettings';
import PreferencesSettings from './pages/settings/PreferencesSettings';
import MedicalContextSettings from './pages/settings/MedicalContextSettings';
import MedicalDocumentIntake from './pages/settings/MedicalDocumentIntake';
import MedicalImportWorkbench from './pages/settings/MedicalImportWorkbench';
import ReferenceReview from './pages/settings/ReferenceReview';

function AppContent() {
  useSaveEventHandler();

  return (
    <>
      <GlobalSaveNotification />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/daily-check-in" element={<DailyCheckIn />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/meals" element={<Meals />} />
          <Route path="/bm-log" element={<BMLog />} />
          <Route path="/food-log" element={<FoodLog />} />
          <Route path="/symptoms-log" element={<SymptomsLog />} />
          <Route path="/sleep-log" element={<SleepLog />} />
          <Route path="/stress-log" element={<StressLog />} />
          <Route path="/hydration-log" element={<HydrationLog />} />
          <Route path="/medication-log" element={<MedicationLog />} />
          <Route path="/menstrual-cycle-log" element={<MenstrualCycleLog />} />
          <Route path="/exercise-log" element={<ExerciseLog />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/profile" element={<ProfileSettings />} />
          <Route path="/settings/notifications" element={<NotificationsSettings />} />
          <Route path="/settings/privacy-security" element={<PrivacySecuritySettings />} />
          <Route path="/settings/billing" element={<BillingSettings />} />
          <Route path="/settings/data-management" element={<DataManagementSettings />} />
          <Route path="/settings/preferences" element={<PreferencesSettings />} />
          <Route path="/settings/medical-context" element={<MedicalContextSettings />} />
          <Route path="/settings/document-intake" element={<MedicalDocumentIntake />} />
          <Route path="/settings/import-workbench" element={<MedicalImportWorkbench />} />
          <Route path="/settings/reference-review" element={<ReferenceReview />} />
          <Route path="/account" element={<Account />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
