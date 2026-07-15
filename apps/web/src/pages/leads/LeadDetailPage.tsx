import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useLead, useUpdateLead, useDeleteLead } from '@/hooks/useLeads';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import StageSelector from './StageSelector';
import LeadInfoForm, { type UpdateLeadPayload } from './LeadInfoForm';
import DeleteLeadDialog from './DeleteLeadDialog';
import ActivityLogSection from './ActivityLogSection';
import { LeadStage } from '@/types/api';

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: lead, isLoading, error } = useLead(id!);
  const updateLead = useUpdateLead(id!);
  const deleteLead = useDeleteLead();

  const handleStageChange = async (stage: LeadStage) => {
    try {
      await updateLead.mutateAsync({ stage });
      toast({
        title: 'Stage updated',
        description: 'Lead stage has been successfully updated.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update stage. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async (data: UpdateLeadPayload) => {
    try {
      await updateLead.mutateAsync(data);
      toast({
        title: 'Lead updated',
        description: 'Lead information has been successfully updated.',
      });
      setIsEditing(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update lead. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteLead.mutateAsync(id!);
      toast({
        title: 'Lead deleted',
        description: 'Lead has been successfully deleted.',
      });
      navigate('/leads');
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete lead. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Lead not found</h2>
          <p className="text-muted-foreground mb-4">
            The lead you're looking for doesn't exist or has been deleted.
          </p>
          <Link to="/leads">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leads
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/leads" className="hover:text-foreground">
          Leads
        </Link>
        <span>/</span>
        <span className="text-foreground">{lead.name}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-foreground">{lead.name}</h1>
          <StageSelector
            currentStage={lead.stage}
            onStageChange={handleStageChange}
            isLoading={updateLead.isPending}
          />
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <LeadInfoForm
                lead={lead}
                isEditing={isEditing}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
                isSaving={updateLead.isPending}
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <ActivityLogSection leadId={lead.id} />
        </div>
      </div>

      <DeleteLeadDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        leadName={lead.name}
        isDeleting={deleteLead.isPending}
      />
    </div>
  );
}
