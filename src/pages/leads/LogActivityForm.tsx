import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateActivity } from '@/hooks/useActivities';
import { useToast } from '@/components/ui/toast';

interface LogActivityFormProps {
  leadId: string;
}

const activitySchema = z.object({
  type: z.enum(['CALL', 'EMAIL', 'MEETING', 'NOTE', 'OTHER']),
  content: z
    .string()
    .min(1, 'Activity details required')
    .max(5000, 'Content must be less than 5000 characters'),
});

type ActivityFormData = z.infer<typeof activitySchema>;

export default function LogActivityForm({ leadId }: LogActivityFormProps) {
  const { toast } = useToast();
  const createActivity = useCreateActivity(leadId);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      type: 'NOTE',
      content: '',
    },
  });

  const activityType = watch('type');

  const onSubmit = async (data: ActivityFormData) => {
    try {
      await createActivity.mutateAsync(data);
      toast({
        title: 'Activity logged',
        description: 'Your activity has been successfully recorded.',
      });
      reset();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to log activity. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Activity Type</Label>
        <Select
          value={activityType}
          onValueChange={(value) =>
            setValue('type', value as ActivityFormData['type'])
          }
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Select activity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CALL">Call</SelectItem>
            <SelectItem value="EMAIL">Email</SelectItem>
            <SelectItem value="MEETING">Meeting</SelectItem>
            <SelectItem value="NOTE">Note</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Activity Details</Label>
        <Textarea
          id="content"
          placeholder="Describe the interaction..."
          {...register('content')}
          className="min-h-[100px]"
        />
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        )}
      </div>

      <Button type="submit" disabled={createActivity.isPending} className="w-full">
        {createActivity.isPending ? 'Logging...' : 'Log Activity'}
      </Button>
    </form>
  );
}
