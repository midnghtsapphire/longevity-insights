import { Bell, Search, Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, Alex
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's your longevity snapshot for today
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search biomarkers..."
            className="w-64 h-10 pl-10 pr-4 rounded-lg bg-secondary/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
          />
        </div>

        {/* Date picker button */}
        <Button variant="outline" size="icon" className="border-border/50">
          <Calendar className="w-4 h-4" />
        </Button>

        {/* Notifications */}
        <Button variant="outline" size="icon" className="border-border/50 relative">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
            3
          </span>
        </Button>

        {/* Add data */}
        <Button variant="hero" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Data
        </Button>
      </div>
    </header>
  );
}
