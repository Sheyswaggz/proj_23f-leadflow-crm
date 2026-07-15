import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLeads } from '@/hooks/useLeads';
import { useDebounce } from '@/hooks/useDebounce';
import LeadCard from './LeadCard';
import LeadFilters from './LeadFilters';
import CreateLeadModal from './CreateLeadModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function LeadsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const search = searchParams.get('search') || '';
  const stage = searchParams.get('stage') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, error } = useLeads({
    search: debouncedSearch,
    stage: stage || undefined,
    page,
    limit: 20,
  });

  const handleSearchChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set('search', value);
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleStageChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set('stage', value);
    } else {
      newParams.delete('stage');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const handleLeadClick = (leadId: string) => {
    navigate(`/leads/${leadId}`);
  };

  const totalPages = data?.pagination.totalPages || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leads</h1>
          {data && (
            <p className="text-sm text-muted-foreground mt-1">
              {data.pagination.total} {data.pagination.total === 1 ? 'lead' : 'leads'}
            </p>
          )}
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <i className="fas fa-plus mr-2" />
          New Lead
        </Button>
      </div>

      <LeadFilters
        search={search}
        onSearchChange={handleSearchChange}
        stage={stage}
        onStageChange={handleStageChange}
      />

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
            <i className="fas fa-exclamation-triangle text-2xl text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Error loading leads
          </h3>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Failed to load leads. Please try again.'}
          </p>
        </div>
      )}

      {!isLoading && !isError && data && data.leads.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <i className="fas fa-users text-2xl text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No leads found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {search || stage
              ? 'Try adjusting your filters to find leads'
              : 'Get started by creating your first lead'}
          </p>
          {!search && !stage && (
            <Button onClick={() => setIsCreateOpen(true)}>
              <i className="fas fa-plus mr-2" />
              Create your first lead
            </Button>
          )}
        </div>
      )}

      {!isLoading && !isError && data && data.leads.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onClick={() => handleLeadClick(lead.id)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                <i className="fas fa-chevron-left" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                <i className="fas fa-chevron-right" />
              </Button>
            </div>
          )}
        </>
      )}

      <CreateLeadModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
