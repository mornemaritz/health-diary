import { DialogContent, TextField } from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import { useState } from "react";
import type { RecordDialogContentProps } from "./RecordDialog";

export interface MedicationRecord {
  recordTime: string;
  medication: string;
  dosage: string;
  schedule: '7am' | '3pm' | '7pm' | '10pm' | 'adhoc';
}

export const RecordMedicationDialogContent = ({
  onSubmit,
  formId,
  ...dialogContentProps
}: RecordDialogContentProps<MedicationRecord>) => {
  const [currentTime, setCurrentTime] = useState(moment());

  return (
    <DialogContent sx={{ pt: 1 }} {...dialogContentProps}>
      <form onSubmit={onSubmit} id={formId}>
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <TimePicker
            sx={{ width: '100%', mb: 2 }}
            name="recordTime"
            label="Time"
            value={currentTime}
            onChange={(newValue) => setCurrentTime(newValue || moment())}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </LocalizationProvider>
        {/* Example with two medication inputs - you could make this dynamic */}
        <TextField
          required
          margin="dense"
          name="medication0"
          label="Medication"
          fullWidth
          variant="standard"
        />
        <TextField
          required
          margin="dense"
          name="dosage0"
          label="Dosage"
          fullWidth
          variant="standard"
        />
        <TextField
          margin="dense"
          name="medication1"
          label="Medication"
          fullWidth
          variant="standard"
        />
        <TextField
          margin="dense"
          name="dosage1"
          label="Dosage"
          fullWidth
          variant="standard"
        />
      </form>
    </DialogContent>
  );
};