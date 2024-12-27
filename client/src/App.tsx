import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Home from "./pages/Home";

function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
    </Switch>
  );
}

export default App;
