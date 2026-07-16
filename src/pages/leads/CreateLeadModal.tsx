import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateLead } from '@/hooks/useLeads';
import { LeadStage } from '@/types/api';
import { useToast } from '@/components/ui/toast';

const createLeadSchema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  stage: z.nativeEnum(LeadStage).optional(),
  notes: z.string().optional(),
  dealValue: z.number().positive().optional(),
});

type CreateLeadFormData = z.infer<typeof createLeadSchema>;

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateLeadModal({ isOpen, onClose }: CreateLeadModalProps) {
  const { toast } = useToast();
  const createLead = useCreateLead();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateLeadFormData>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      jobTitle: '',
      stage: LeadStage.NEW,
      notes: '',
    },
  });

  const stageValue = watch('stage');

  const onSubmit = async (data: CreateLeadFormData) => {
    try {
      await createLead.mutateAsync({
        ...data,
        dealValue: data.dealValue?.toString(),
      });
      toast({
        title: 'Lead created',
        description: 'The lead has been successfully created.',
      });
      reset();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create lead. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Lead</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter lead name"
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="email@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                {...register('company')}
                placeholder="Company name"
              />
            </div>

            <div>
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                {...register('jobTitle')}
                placeholder="Job title"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stage">Stage</Label>
              <Select
                value={stageValue}
                onValueChange={(value) => setValue('stage', value as LeadStage)}
              >
                <SelectTrigger id="stage">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LeadStage.NEW}>New</SelectItem>
                  <SelectItem value={LeadStage.CONTACTED}>Contacted</SelectItem>
                  <SelectItem value={LeadStage.QUALIFIED}>Qualified</SelectItem>
                  <SelectItem value={LeadStage.PROPOSAL_SENT}>Proposal Sent</SelectItem>
                  <SelectItem value={LeadStage.CLOSED_WON}>Closed Won</SelectItem>
                  <SelectItem value={LeadStage.CLOSED_LOST}>Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dealValue">Deal Value</Label>
              <Input
                id="dealValue"
                type="number"
                step="0.01"
                {...register('dealValue', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.dealValue && (
                <p className="text-sm text-destructive mt-1">{errors.dealValue.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Add any additional notes..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createLead.isPending}>
              {createLead.isPending ? 'Creating...' : 'Create Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
