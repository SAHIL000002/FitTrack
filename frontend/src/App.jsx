import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar.jsx';

// Routes where the global Navbar should NOT appear (they have their own layout)
const NO_NAVBAR_PREFIXES = ['/owner', '/member'];

// '/member' alone would also match '/membership' (the navbar-disappear bug),
// so require an exact match or a trailing slash.
function isDashboardRoute(pathname) {
  return NO_NAVBAR_PREFIXES.some((x) => pathname === x || pathname.startsWith(x + '/'));
}
import Home from './pages/Home.jsx';
import Programs from './pages/Programs.jsx';
import ProgramDetail from './pages/ProgramDetail.jsx';
import Equipment from './pages/Equipment.jsx';
import Trainers from './pages/Trainers.jsx';
import Membership from './pages/Membership.jsx';
import HomeWorkout from './pages/HomeWorkout.jsx';
import HomeWorkoutPlan from './pages/HomeWorkoutPlan.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import OwnerDashboard from './pages/OwnerDashboard.jsx';
import MemberOverview from './pages/MemberOverview.jsx';
import MemberProfile from './pages/MemberProfile.jsx';
import MemberMembership from './pages/MemberMembership.jsx';
import MemberPlans from './pages/MemberPlans.jsx';
import MemberPayments from './pages/MemberPayments.jsx';
import MemberAttendance from './pages/MemberAttendance.jsx';
import { MemberWorkouts, MemberWorkoutDetail } from './pages/MemberWorkouts.jsx';
import { MemberProgress } from './pages/MemberProgress.jsx';
import { MemberProgressDetail } from './pages/MemberProgressDetail.jsx';
import MemberTrainer from './pages/MemberTrainer.jsx';
import MemberNotifications from './pages/MemberNotifications.jsx';
import MemberEnquiries from './pages/MemberEnquiries.jsx';
import MemberSettings from './pages/MemberSettings.jsx';
import OwnerMembers from './pages/OwnerMembers.jsx';
import OwnerMemberDetail from './pages/OwnerMemberDetail.jsx';
import OwnerMemberships from './pages/OwnerMemberships.jsx';
import OwnerPayments from './pages/OwnerPayments.jsx';
import OwnerAttendance from './pages/OwnerAttendance.jsx';
import OwnerTrainers from './pages/OwnerTrainers.jsx';
import OwnerTrainerDetail from './pages/OwnerTrainerDetail.jsx';
import OwnerPrograms from './pages/OwnerPrograms.jsx';
import OwnerProgramDetail from './pages/OwnerProgramDetail.jsx';
import OwnerWorkouts from './pages/OwnerWorkouts.jsx';
import OwnerWorkoutDetail from './pages/OwnerWorkoutDetail.jsx';
import OwnerProgress from './pages/OwnerProgress.jsx';
import OwnerEnquiries from './pages/OwnerEnquiries.jsx';
import OwnerEnquiryDetail from './pages/OwnerEnquiryDetail.jsx';
import OwnerAnnouncements from './pages/OwnerAnnouncements.jsx';
import OwnerNotifications from './pages/OwnerNotifications.jsx';
import OwnerEquipment from './pages/OwnerEquipment.jsx';
import OwnerSettings from './pages/OwnerSettings.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const O = (C) => <ProtectedRoute roles={['OWNER']}><C /></ProtectedRoute>;
const M = (C) => <ProtectedRoute roles={['MEMBER']}><C /></ProtectedRoute>;

function AppInner() {
  const { pathname } = useLocation();
  const hideNavbar = isDashboardRoute(pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/programs/:slug" element={<ProgramDetail />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/trainers" element={<Trainers />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/home-workout" element={<HomeWorkout />} />
        <Route path="/home-workout/:level" element={<HomeWorkoutPlan />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/owner" element={O(OwnerDashboard)} />
        <Route path="/owner/members" element={O(OwnerMembers)} />
        <Route path="/owner/members/:id" element={O(OwnerMemberDetail)} />
        <Route path="/owner/memberships" element={O(OwnerMemberships)} />
        <Route path="/owner/memberships/:id" element={O(OwnerMemberships)} />
        <Route path="/owner/payments" element={O(OwnerPayments)} />
        <Route path="/owner/payments/:id" element={O(OwnerPayments)} />
        <Route path="/owner/attendance" element={O(OwnerAttendance)} />
        <Route path="/owner/trainers" element={O(OwnerTrainers)} />
        <Route path="/owner/trainers/:id" element={O(OwnerTrainerDetail)} />
        <Route path="/owner/programs" element={O(OwnerPrograms)} />
        <Route path="/owner/programs/:id" element={O(OwnerProgramDetail)} />
        <Route path="/owner/workouts" element={O(OwnerWorkouts)} />
        <Route path="/owner/workouts/:id" element={O(OwnerWorkoutDetail)} />
        <Route path="/owner/progress" element={O(OwnerProgress)} />
        <Route path="/owner/progress/:id" element={O(OwnerProgress)} />
        <Route path="/owner/enquiries" element={O(OwnerEnquiries)} />
        <Route path="/owner/enquiries/:id" element={O(OwnerEnquiryDetail)} />
        <Route path="/owner/announcements" element={O(OwnerAnnouncements)} />
        <Route path="/owner/announcements/:id" element={O(OwnerAnnouncements)} />
        <Route path="/owner/notifications" element={O(OwnerNotifications)} />
        <Route path="/owner/equipment" element={O(OwnerEquipment)} />
        <Route path="/owner/equipment/:id" element={O(OwnerEquipment)} />
        <Route path="/owner/settings" element={O(OwnerSettings)} />
        <Route path="/member" element={M(MemberOverview)} />
        <Route path="/member/profile" element={M(MemberProfile)} />
        <Route path="/member/membership" element={M(MemberMembership)} />
        <Route path="/member/plans" element={M(MemberPlans)} />
        <Route path="/member/payments" element={M(MemberPayments)} />
        <Route path="/member/attendance" element={M(MemberAttendance)} />
        <Route path="/member/workouts" element={M(MemberWorkouts)} />
        <Route path="/member/workouts/:id" element={M(MemberWorkoutDetail)} />
        <Route path="/member/progress" element={M(MemberProgress)} />
        <Route path="/member/progress/:id" element={M(MemberProgressDetail)} />
        <Route path="/member/trainer" element={M(MemberTrainer)} />
        <Route path="/member/notifications" element={M(MemberNotifications)} />
        <Route path="/member/enquiries" element={M(MemberEnquiries)} />
        <Route path="/member/settings" element={M(MemberSettings)} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App;


