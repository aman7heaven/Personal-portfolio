import { Switch, Route } from "wouter";
import PortfolioPage from "@/pages/portfolio-page";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import AdminDashboard from "@/pages/admin/dashboard";
import AboutEditor from "@/pages/admin/about-editor";
import SkillsEditor from "@/pages/admin/skills-editor";
import ExperienceEditor from "@/pages/admin/experience-editor";
import ProjectsEditor from "@/pages/admin/projects-editor";
import Settings from "@/pages/admin/settings";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={PortfolioPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Admin routes - protected */}
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/admin/about" component={AboutEditor} />
      <ProtectedRoute path="/admin/skills" component={SkillsEditor} />
      <ProtectedRoute path="/admin/experience" component={ExperienceEditor} />
      <ProtectedRoute path="/admin/projects" component={ProjectsEditor} />
      <ProtectedRoute path="/admin/settings" component={Settings} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return <Router />;
}

export default App;
