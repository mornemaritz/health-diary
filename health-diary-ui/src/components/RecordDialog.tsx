import { Button, Dialog, type DialogProps } from "@mui/material";
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';

// Base props for dialog content
export interface RecordDialogContentProps<T> {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  formId: string;
}

export interface RecordDialogProps<T> extends Omit<DialogProps, 'onClose'> {
  title: string;
  ContentComponent: React.ComponentType<RecordDialogContentProps<T>>;
  onRecord: (data: T) => void;
  onClose: () => void;
}

export const RecordDialog = <T,>({
  title,
  onRecord,
  onClose,
  ContentComponent,
  ...dialogProps
}: RecordDialogProps<T>) => {
  const formId = 'record-form';
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    // Get all medications (we know there are at least 2 slots)
    const medications = [0, 1].map(i => ({
      recordTime: formData.get(`recordTime`),
      medication: formData.get(`medication${i}`),
      dosage: formData.get(`dosage${i}`),
      schedule: formData.get(`schedule`) || 'adhoc'
    })).filter(med => med.medication); // Filter out empty medication slots

    // For now we'll just take the first medication as T
    const medicationRecord = medications[0] as T;
    
    onRecord(medicationRecord);
    onClose();
  };

  return (
    <Dialog
      {...dialogProps}
      keepMounted={false}
      disablePortal={false}
    >
      <DialogTitle>{title}</DialogTitle>
      <ContentComponent onSubmit={handleSubmit} formId={formId} />
      <DialogActions>
        <Button color="error" variant="contained" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" type="submit" form={formId}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
