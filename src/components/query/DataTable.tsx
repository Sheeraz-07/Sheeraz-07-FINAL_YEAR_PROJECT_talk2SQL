import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Copy,
  Check,
  ArrowUpDown,
  Table as TableIcon,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface DataTableProps {
  data: Record<string, unknown>[];
  columns: string[];
  className?: string;
}

export function DataTable({ data, columns, className }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(columns));
  const [copied, setCopied] = useState(false);

  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, data.length);

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const paginatedData = sortedData.slice(startIndex, endIndex);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleCopyTable = async () => {
    const header = columns.filter((c) => visibleColumns.has(c)).join('\t');
    const rows = sortedData.map((row) =>
      columns
        .filter((c) => visibleColumns.has(c))
        .map((c) => String(row[c] ?? ''))
        .join('\t')
    );
    await navigator.clipboard.writeText([header, ...rows].join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = (format: 'csv' | 'excel') => {
    const header = columns.filter((c) => visibleColumns.has(c)).join(',');
    const rows = sortedData.map((row) =>
      columns
        .filter((c) => visibleColumns.has(c))
        .map((c) => `"${String(row[c] ?? '').replace(/"/g, '""')}"`)
        .join(',')
    );
    const content = [header, ...rows].join('\n');
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query-results.${format === 'excel' ? 'csv' : 'csv'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleColumn = (column: string) => {
    setVisibleColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(column)) {
        newSet.delete(column);
      } else {
        newSet.add(column);
      }
      return newSet;
    });
  };

  return (
    <div className={cn('bg-card rounded-xl border border-border overflow-hidden', className)}>
      {/* Table Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <TableIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {data.length} rows
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column}
                  checked={visibleColumns.has(column)}
                  onCheckedChange={() => toggleColumn(column)}
                >
                  {column}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Copy */}
          <Button variant="outline" size="sm" onClick={handleCopyTable}>
            {copied ? (
              <Check className="h-4 w-4 mr-2 text-success" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            Copy
          </Button>

          {/* Export */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem onClick={() => handleExport('csv')}>
                Export as CSV
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem onClick={() => handleExport('excel')}>
                Export as Excel
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns
                .filter((c) => visibleColumns.has(c))
                .map((column) => (
                  <TableHead
                    key={column}
                    className="cursor-pointer hover:bg-secondary/50 transition-colors"
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="capitalize">{column}</span>
                      <ArrowUpDown
                        className={cn(
                          'h-3 w-3 transition-colors',
                          sortColumn === column
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        )}
                      />
                    </div>
                  </TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, idx) => (
              <TableRow key={idx} className="hover:bg-secondary/30">
                {columns
                  .filter((c) => visibleColumns.has(c))
                  .map((column) => (
                    <TableCell key={column}>
                      {String(row[column] ?? '-')}
                    </TableCell>
                  ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {startIndex + 1}-{endIndex} of {data.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
