import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import AdminDashboard from "@/pages/admin/dashboard";
import AboutEdit from "@/pages/admin/about-edit";
import SkillsEdit from "@/pages/admin/skills-edit";
import ExperienceEdit from "@/pages/admin/experience-edit";
import ProjectsEdit from "@/pages/admin/projects-edit";
import ContactEdit from "@/pages/admin/contact-edit";
import SiteSettings from "@/pages/admin/site-settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Admin Routes */}
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/admin/about" component={AboutEdit} />
      <ProtectedRoute path="/admin/skills" component={SkillsEdit} />
      <ProtectedRoute path="/admin/experience" component={ExperienceEdit} />
      <ProtectedRoute path="/admin/projects" component={ProjectsEdit} />
      <ProtectedRoute path="/admin/contact" component={ContactEdit} />
      <ProtectedRoute path="/admin/settings" component={SiteSettings} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return <Router />;
}

export default App;
