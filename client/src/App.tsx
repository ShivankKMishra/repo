import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import StandaloneAuthPage from "@/pages/StandaloneAuthPage";
import { ProtectedRoute } from "./lib/protected-route";
import ErrorBoundary from "@/components/ui/error-boundary";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={StandaloneAuthPage} />
      {/* Protected routes would be like this: */}
      {/* <ProtectedRoute path="/profile" component={ProfilePage} /> */}
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
      <ErrorBoundary>
        <Router />
      </ErrorBoundary>
      <Toaster />
    </>
  );
}

export default App;
