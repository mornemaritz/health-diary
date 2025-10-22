import { DialogContent, TextField } from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import { useState } from "react";

export interface MedicationRecord {
  recordTime: string;
  medication: string;
  dosage: string;
  schedule: '7am' | '3pm' | '7pm' | '10pm' | 'adhoc';
}

export const RecordMedicationDialogContent = ({
  formId,
  onRecord,
}: { formId: string; onRecord: (data: MedicationRecord) => void }) => {
  const [currentTime, setCurrentTime] = useState(moment());

  const handleLocalSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const recordTime = formData.get('recordTime')?.toString() || currentTime.format();
    const medication = (formData.get('medication0') || formData.get('medication1') || '') as string;
    const dosage = (formData.get('dosage0') || formData.get('dosage1') || '') as string;
    const schedule = (formData.get('schedule') as any) || 'adhoc';

    const record: MedicationRecord = {
      recordTime: recordTime.toString(),
      medication: medication.toString(),
      dosage: dosage.toString(),
      schedule: schedule as MedicationRecord['schedule'],
    };

    onRecord(record);
  };

  return (
    <DialogContent sx={{ pt: 1 }}>
      <form onSubmit={handleLocalSubmit} id={formId}>
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