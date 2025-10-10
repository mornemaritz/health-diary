import { Button, Dialog, TextField, type DialogProps } from "@mui/material";
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import { useState } from "react";

interface BottleData {
  bottleTime: string;
  bottleSize: number;
}

interface RecordBottleDialogProps extends DialogProps {
  onRecordBottle?: (data: BottleData) => void;
}

export const RecordBottleDialog = ({ onRecordBottle, ...dialogProps }: RecordBottleDialogProps) => {
  const [currentTime, setCurrentTime] = useState(moment());

  const handleClose = () => {
    dialogProps.onClose?.({}, 'backdropClick');
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries((formData as any).entries());
    const bottleData: BottleData = {
      bottleTime: currentTime.format(),
      bottleSize: Number(formJson.bottleSize),
    };
    onRecordBottle?.(bottleData);
    handleClose();
  };

 return (
    <Dialog
      {...dialogProps}
      keepMounted={false}
      disablePortal={false}>
      <DialogTitle>Record Bottle</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <form onSubmit={handleSubmit} id="bottle-form">
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <TimePicker
              sx={{ width: '100%', mt: 1 }}
              autoFocus
              name="bottleTime"
              label="Time"
              value={currentTime}
              onChange={(newValue) => setCurrentTime(newValue || moment())}
            />
          </LocalizationProvider>
          <TextField
            autoFocus
            required
            margin="dense"
            id="bottleSize"
            name="bottleSize"
            label="Bottle Size (ml)"
            type="number"
            fullWidth
            variant="standard"
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button color="error" variant="contained" onClick={handleClose}>Cancel</Button>
        <Button variant="contained" type="submit" form="bottle-form">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
