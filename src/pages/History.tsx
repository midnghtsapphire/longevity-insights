import { useState, useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon, Filter, FlaskConical, Search, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAllBiomarkers } from "@/hooks/useAllBiomarkers";
import { AddBiomarkerModal } from "@/components/AddBiomarkerModal";
import { EditBiomarkerModal } from "@/components/EditBiomarkerModal";
import { DeleteBiomarkerDialog } from "@/components/DeleteBiomarkerDialog";

const History = () => {
  const { biomarkers, loading, uniqueNames } = useAllBiomarkers();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBiomarker, setSelectedBiomarker] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Filter biomarkers based on search, type, and date range
  const filteredBiomarkers = useMemo(() => {
    return biomarkers.filter((biomarker) => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        biomarker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        biomarker.notes?.toLowerCase().includes(searchQuery.toLowerCase());

      // Biomarker type filter
      const matchesType = selectedBiomarker === "all" || 
        biomarker.name === selectedBiomarker;

      // Date range filter
      const measureDate = new Date(biomarker.measured_at);
      const matchesStartDate = !startDate || measureDate >= startDate;
      const matchesEndDate = !endDate || measureDate <= endDate;

      return matchesSearch && matchesType && matchesStartDate && matchesEndDate;
    });
  }, [biomarkers, searchQuery, selectedBiomarker, startDate, endDate]);

  const getStatusBadge = (value: number, refMin: number | null, refMax: number | null) => {
    if (refMin === null || refMax === null) {
      return <Badge variant="secondary">No ref</Badge>;
    }
    
    if (value >= refMin && value <= refMax) {
      return <Badge className="bg-success/20 text-success border-success/30">Optimal</Badge>;
    }
    
    const range = refMax - refMin;
    const warningBuffer = range * 0.1;
    
    if (value < refMin - warningBuffer || value > refMax + warningBuffer) {
      return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Critical</Badge>;
    }
    
    return <Badge className="bg-warning/20 text-warning border-warning/30">Warning</Badge>;
  };

  const getTrendIcon = (value: number, refMin: number | null, refMax: number | null) => {
    if (refMin === null || refMax === null) {
      return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
    
    const midpoint = (refMin + refMax) / 2;
    
    if (value > midpoint) {
      return <TrendingUp className="w-4 h-4 text-primary" />;
    } else if (value < midpoint) {
      return <TrendingDown className="w-4 h-4 text-accent" />;
    }
    
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedBiomarker("all");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const hasActiveFilters = searchQuery !== "" || selectedBiomarker !== "all" || startDate || endDate;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Biomarker History</h1>
            <p className="text-muted-foreground mt-1">View and filter all your biomarker readings</p>
          </div>
          <AddBiomarkerModal />
        </div>

        {/* Filters */}
        <Card className="mb-6" variant="glass">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </CardTitle>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search biomarkers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-input border-border"
                />
              </div>

              {/* Biomarker Type */}
              <Select value={selectedBiomarker} onValueChange={setSelectedBiomarker}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="All biomarkers" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  <SelectItem value="all">All biomarkers</SelectItem>
                  {uniqueNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Start Date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal bg-input border-border",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "MMM d, yyyy") : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover border-border z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              {/* End Date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal bg-input border-border",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "MMM d, yyyy") : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover border-border z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-base">
              {loading ? "Loading..." : `${filteredBiomarkers.length} readings`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredBiomarkers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="p-4 rounded-full bg-primary/10 mb-4">
                  <FlaskConical className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No readings found</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  {hasActiveFilters 
                    ? "Try adjusting your filters to see more results"
                    : "Start tracking your health by adding your first biomarker reading"
                  }
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Biomarker</TableHead>
                    <TableHead className="text-muted-foreground">Value</TableHead>
                    <TableHead className="text-muted-foreground">Reference Range</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Notes</TableHead>
                    <TableHead className="text-muted-foreground w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBiomarkers.map((biomarker) => (
                    <TableRow key={biomarker.id} className="border-border">
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          {getTrendIcon(biomarker.value, biomarker.reference_min, biomarker.reference_max)}
                          {biomarker.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        <span className="font-semibold">{biomarker.value}</span>
                        <span className="text-muted-foreground ml-1">{biomarker.unit}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {biomarker.reference_min !== null && biomarker.reference_max !== null
                          ? `${biomarker.reference_min} - ${biomarker.reference_max} ${biomarker.unit}`
                          : "—"
                        }
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(biomarker.value, biomarker.reference_min, biomarker.reference_max)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(biomarker.measured_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">
                        {biomarker.notes || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <EditBiomarkerModal biomarker={biomarker} />
                          <DeleteBiomarkerDialog biomarker={biomarker} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default History;
