import { Button, Dialog, type DialogProps } from "@mui/material";
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';

export interface RecordDialogProps<T> extends Omit<DialogProps, 'onClose'> {
  title: string;
  formId: string;
  ContentComponent: React.ComponentType<{ formId: string; onRecord: (data: T) => void }>;
  onRecord: (data: T) => void;
  onClose: () => void;
}

export const RecordDialog = <T,>({
  title,
  formId,
  onRecord,
  onClose,
  ContentComponent,
  ...dialogProps
}: RecordDialogProps<T>) => {

  return (
    <Dialog
      {...dialogProps}
      keepMounted={false}
      disablePortal={false}
    >
      <DialogTitle sx={{ textAlign: 'center', padding: '10px' }}>{title}</DialogTitle>
      <ContentComponent
        formId={formId}
        onRecord={(data: T) => {
          onRecord(data);
          onClose();
      }}
      />
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
