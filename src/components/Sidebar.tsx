import { 
  LayoutDashboard, 
  History,
  Watch, 
  Settings, 
  User,
  ChevronRight,
  Dna,
  LogOut
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: History, label: "History", href: "/history" },
  { icon: Watch, label: "Wearables", href: "/wearables" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  // Get display name from user metadata or email
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 glass border-r border-border/50 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl gradient-primary glow-primary">
            <Dna className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground tracking-tight">Longevity</h1>
            <p className="text-xs text-muted-foreground">Biomarker Tracker</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {isActive && (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
