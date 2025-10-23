import { DialogContent } from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DataGrid, type GridRowsProp, type GridColDef } from '@mui/x-data-grid';
import moment from "moment";
import { useState } from "react";

export interface MedicationRecord {
  recordTime: string;
  medication: string;
  dosage: string;
  schedule: '7am' | '3pm' | '7pm' | '10pm' | 'adhoc';
};

const medications = {
  '7am' : [
    'Epilim - 4ml',
    'Gabapentin - 300mg',
    'Risperidone - 1mg',
    'Nexium - 20mg',
    'Movicol - 0.5 sachet',
    'Hyfibre - 15ml',
    'Purmycin (125) - 3.2ml',
    'Panado - 10ml'
  ],
  '3pm' : [
    'Epilim - 4ml',
    'Gabapentin - 300mg',
    'Movicol - 0.5 sachet',
    'Hyfibre - 15ml',
    'Purmycin (125) - 3.2ml'
  ],
  '7pm' : [
    'Menograine - 4 tablets',
    'Urbanol - 5mg'
  ],
  '10pm' : [
    'Epilim - 4ml',
    'Gabapentin - 300mg',
    'Senokot - 0.5 tablet',
    'Probiotics - 1 capsule',
    'Slippery Elm - 5 drops',
    'Liquorice Root - 5 drops'
  ],
  'adhoc': ['Panado - 10ml', 'Neurofen - 5ml']
}

const columns: GridColDef[] = [
  { field: 'medication', flex: 1, headerName: 'Medication' }
];

export const RecordMedicationDialogContent = ({
  formId,
  onRecord,
}: { formId: string; onRecord: (data: MedicationRecord[]) => void }) => {
  const [recordTime, setRecordTime] = useState(moment());
  const [schedule] = useState<MedicationRecord['schedule']>('adhoc');
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
  const [gridRows] = useState<GridRowsProp>([
    ...medications[schedule].map((med) => ({ id: med, medication: med })),
  ]);

  const handleLocalSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const record = selectedMedications.map(selectedMedication => {
      var [medication, dosage] = selectedMedication.split(' - ');

      return { recordTime: recordTime.format('hh:mma'), medication, dosage, schedule };
    })

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
            value={recordTime}
            onChange={(newValue) => setRecordTime(newValue || moment())}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </LocalizationProvider>
        <DataGrid
          hideFooter
          disableColumnMenu
          disableColumnFilter
          disableColumnSelector
          disableRowSelectionExcludeModel
          density='compact'
          columns={columns}
          rows={gridRows}
          checkboxSelection
          onRowSelectionModelChange={(newSelection) => setSelectedMedications(Array.from(newSelection.ids.values(), id => id.toString()))}
        />
      </form>
    </DialogContent>
  );
};