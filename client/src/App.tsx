import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/HomeNew";
import ArticleDetail from "./pages/ArticleDetail";
import { ArticlePage } from "./pages/ArticlePage";
import { AuthorPage } from "./pages/AuthorPage";
import Category from "./pages/Category";
import Tag from "./pages/Tag";
import Search from "./pages/Search";
import Events from "./pages/Events";
import NewsPage from "./pages/NewsPage";
import CaptainsPage from "./pages/CaptainsPage";
import CrewLifePage from "./pages/CrewLifePage";
import MagazinePage from "./pages/MagazinePage";
import EventsPageNew from "./pages/EventsPageNew";
import AdvertisePage from "./pages/AdvertisePage";
import AdvertisementAnalytics from "./pages/AdvertisementAnalytics";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/article/:slug" component={ArticlePage} />
      <Route path="/author/:slug" component={AuthorPage} />
      <Route path="/news" component={NewsPage} />
      <Route path="/captains" component={CaptainsPage} />
      <Route path="/crew-life" component={CrewLifePage} />
      <Route path="/magazine" component={MagazinePage} />
      <Route path="/events" component={EventsPageNew} />
      <Route path="/advertise" component={AdvertisePage} />
      <Route path="/ad-analytics" component={AdvertisementAnalytics} />
      <Route path="/category/:slug" component={Category} />
      <Route path="/tag/:slug" component={Tag} />
      <Route path="/search" component={Search} />
      
      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
