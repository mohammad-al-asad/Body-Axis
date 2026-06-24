import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../Layout/Main/Main";
import SignIn from "../Pages/Auth/SignIn/SignIn";
import ForgatePassword from "../Pages/Auth/ForgatePassword/ForgatePassword";
import PrivateRoute from "./PrivateRoute";
import Dashboard from "../Pages/Dashboard/Dashboard";
import VerifyCode from "../Pages/Auth/VerifyCode/VerifyCode";
import NewPass from "../Pages/Auth/NewPass/NewPass";
import UserManagement from "../Pages/UserManagement/UserManagement";
import UserDetails from "../Pages/UserManagement/UserDetails";
import EventDetails from "../Pages/UserManagement/EventDetails";
import PlanManager from "../Pages/PlanManager/PlanManager";
import CreatePlan from "../Pages/PlanManager/CreatePlan";
import ExerciseLibrary from "../Pages/ExerciseLibrary/ExerciseLibrary";
import AddExercise from "../Pages/ExerciseLibrary/AddExercise";
import VideoManager from "../Pages/VideoManager/VideoManager";
import UploadVideo from "../Pages/VideoManager/UploadVideo";
import SubscriptionManagement from "../Pages/SubscriptionManagement/SubscriptionManagement";
import Settings from "../Pages/Settings/Settings";
import PrivacyPolicy from "../Pages/AppContent/PrivacyPolicy";
import TermsAndConditions from "../Pages/AppContent/TermsAndConditions";
import AboutApp from "../Pages/AppContent/AboutApp";
import SupportMessages from "../Pages/AppContent/SupportMessages";
import FAQList from "../Pages/AppContent/FAQList";
import AddFAQ from "../Pages/AppContent/AddFAQ";
export const router = createBrowserRouter([
  {
    path: "/sign-in",
    element: <SignIn />,
  },
  {
    path: "/forgate-password",
    element: <ForgatePassword />,
  },
  {
    path: "/verify-code",
    element: <VerifyCode />,
  },
  {
    path: "/new-password",
    element: <NewPass />,
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          { path: "/", element: <Dashboard /> },
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/plan-manager", element: <PlanManager /> },
          { path: "/user-management", element: <UserManagement /> },
          { path: "/user-management/:id", element: <UserDetails /> },
          { path: "/event-details/:id", element: <EventDetails /> },
          { path: "/create-plan", element: <CreatePlan /> },
          { path: "/plan-manager/:planId/edit", element: <CreatePlan /> },
          { path: "/exercise-library", element: <ExerciseLibrary /> },
          { path: "/add-exercise", element: <AddExercise /> },
          {
            path: "/exercise-library/:exerciseId/edit",
            element: <AddExercise />,
          },
          { path: "/video-manager", element: <VideoManager /> },
          { path: "/upload-video", element: <UploadVideo /> },
          { path: "/video-manager/:videoId/edit", element: <UploadVideo /> },
          { path: "/subscription", element: <SubscriptionManagement /> },
          { path: "/settings", element: <Settings /> },
          { path: "/privacy-policy", element: <PrivacyPolicy /> },
          { path: "/terms-and-conditions", element: <TermsAndConditions /> },
          { path: "/about-app", element: <AboutApp /> },
          { path: "/support-messages", element: <SupportMessages /> },
          { path: "/faq", element: <FAQList /> },
          { path: "/add-faq", element: <AddFAQ /> },
        ],
      },
    ],
  },
]);
