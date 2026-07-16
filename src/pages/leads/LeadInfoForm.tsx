import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Lead, LeadStage } from '@/types/api';

const updateLeadSchema = z.object({
  name: z.string().min(1, 'Name required').optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  stage: z.nativeEnum(LeadStage).optional(),
  notes: z.string().optional(),
  dealValue: z.string().optional(),
});

export type UpdateLeadPayload = z.infer<typeof updateLeadSchema>;

interface LeadInfoFormProps {
  lead: Lead;
  isEditing: boolean;
  onSave: (data: UpdateLeadPayload) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export default function LeadInfoForm({ lead, isEditing, onSave, onCancel, isSaving }: LeadInfoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateLeadPayload>({
    resolver: zodResolver(updateLeadSchema),
  });

  useEffect(() => {
    reset({
      name: lead.name,
      email: lead.email || '',
      phone: lead.phone || '',
      company: lead.company || '',
      jobTitle: lead.jobTitle || '',
      dealValue: lead.dealValue || '',
      notes: lead.notes || '',
    });
  }, [lead, reset]);

  if (!isEditing) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="text-muted-foreground">Name</Label>
          <p className="mt-1 text-foreground">{lead.name}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">Email</Label>
          <p className="mt-1 text-foreground">{lead.email || '—'}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">Phone</Label>
          <p className="mt-1 text-foreground">{lead.phone || '—'}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">Company</Label>
          <p className="mt-1 text-foreground">{lead.company || '—'}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">Job Title</Label>
          <p className="mt-1 text-foreground">{lead.jobTitle || '—'}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">Deal Value</Label>
          <p className="mt-1 text-foreground">{lead.dealValue ? `$${lead.dealValue}` : '—'}</p>
        </div>
        <div className="md:col-span-2">
          <Label className="text-muted-foreground">Notes</Label>
          <p className="mt-1 text-foreground whitespace-pre-wrap">{lead.notes || '—'}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Enter lead name"
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>

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

        <div>
          <Label htmlFor="dealValue">Deal Value</Label>
          <Input
            id="dealValue"
            {...register('dealValue')}
            placeholder="0.00"
          />
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

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
