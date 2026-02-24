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
    <div className={cn('bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border-0 shadow-xl overflow-hidden', className)}>
      {/* Table Header */}
      <div className="flex items-center justify-between p-6 border-b-2 border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 shadow-md">
            <TableIcon className="h-5 w-5 text-white" />
          </div>
          <span className="text-base font-bold text-slate-900 dark:text-white">
            {data.length} rows
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 h-10 px-4">
                <Eye className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column}
                  checked={visibleColumns.has(column)}
                  onCheckedChange={() => toggleColumn(column)}
                  className="rounded-lg font-medium capitalize"
                >
                  {column}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Copy */}
          <Button variant="outline" size="sm" onClick={handleCopyTable} className="rounded-full font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 h-10 px-4">
            {copied ? (
              <Check className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            Copy
          </Button>

          {/* Export */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 h-10 px-4">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
              <DropdownMenuCheckboxItem onClick={() => handleExport('csv')} className="rounded-lg font-medium">
                Export as CSV
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem onClick={() => handleExport('excel')} className="rounded-lg font-medium">
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
            <TableRow className="border-b-2 border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:bg-gradient-to-r hover:from-slate-200 hover:to-slate-100 dark:hover:from-slate-700 dark:hover:to-slate-800">
              {columns
                .filter((c) => visibleColumns.has(c))
                .map((column) => (
                  <TableHead
                    key={column}
                    className="cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all duration-200 first:rounded-tl-xl last:rounded-tr-xl"
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="capitalize text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{column}</span>
                      <ArrowUpDown
                        className={cn(
                          'h-4 w-4 transition-all duration-200',
                          sortColumn === column
                            ? 'text-indigo-600 dark:text-indigo-400 scale-110'
                            : 'text-slate-400 dark:text-slate-600'
                        )}
                      />
                    </div>
                  </TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, idx) => (
              <TableRow key={idx} className={cn(
                "border-b border-slate-200 dark:border-slate-700 transition-all duration-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 dark:hover:from-indigo-950/20 dark:hover:to-blue-950/20 hover:shadow-sm",
                idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/50'
              )}>
                {columns
                  .filter((c) => visibleColumns.has(c))
                  .map((column) => {
                    const value = row[column];
                    const isNumber = typeof value === 'number';
                    return (
                      <TableCell key={column} className={cn(
                        "font-medium text-slate-900 dark:text-slate-100",
                        isNumber && "text-right tabular-nums"
                      )}>
                        {String(value ?? '-')}
                      </TableCell>
                    );
                  })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-6 border-t-2 border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Rows per page:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-24 h-10 rounded-xl border-2 shadow-sm font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
              <SelectItem value="10" className="font-semibold rounded-lg">10</SelectItem>
              <SelectItem value="25" className="font-semibold rounded-lg">25</SelectItem>
              <SelectItem value="50" className="font-semibold rounded-lg">50</SelectItem>
              <SelectItem value="100" className="font-semibold rounded-lg">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {startIndex + 1}-{endIndex} of {data.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
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
