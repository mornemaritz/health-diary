import { Button, Dialog, type DialogProps } from "@mui/material";
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import { type DialogContentProps } from '@mui/material/DialogContent';

export interface RecordDialogProps<T> extends Omit<DialogProps, 'onClose'> {
  title: string;
  ContentComponent: React.ComponentType<RecordDialogContentProps>;
  onRecord: (data: T) => void;
  onClose: () => void;
}

export interface RecordDialogContentProps extends DialogContentProps {
  onSubmit: (event: React.FormEvent<HTMLDivElement>) => void;
}

export const RecordDialog = <T,>({
  title,
  onRecord,
  onClose,
  ContentComponent,
  ...dialogProps
}: RecordDialogProps<T>) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries((formData as any).entries());
    onRecord(formJson as T);
    onClose();
  };

  return (
    <Dialog
      {...dialogProps}
      keepMounted={false}
      disablePortal={false}
    >
      <DialogTitle>{title}</DialogTitle>
      {/* Replace this DialogContent with a derived DialogContent component */}
      {/* <RecordMedicationDialogContent/> for example */}
      {/* <DialogContent sx={{ pt: 1 }}>
        <form onSubmit={handleSubmit} id="record-form">
        </form>
      </DialogContent> */}
      <ContentComponent onSubmit={handleSubmit} />
      <DialogActions>
        <Button color="error" variant="contained" onClick={onClose}>Cancel</Button>
        <Button variant="contained" type="submit" form="record-form">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
