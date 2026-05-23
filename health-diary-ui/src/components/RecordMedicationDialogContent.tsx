import { Box, Chip, Container, DialogContent, Stack, Typography } from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DataGrid, type GridRowsProp, type GridColDef } from '@mui/x-data-grid';
import moment from "moment";
import { useEffect, useState } from "react";
import { getMedicationDosageGroups } from "../services/healthRecordService";

export interface MedicationRecord {
  recordTime: string;
  medication: string;
  dosage: string;
  schedule: '7am' | '3pm' | '7pm' | '10pm' | 'adhoc';
};

const EMPTY_MEDICATIONS: Record<string, string[]> = {
  '7am': [], '3pm': [], '7pm': [], '10pm': [], adhoc: [],
};

const columns: GridColDef[] = [
  { field: 'medication', flex: 1, headerName: 'Medication' }
];

export const RecordMedicationDialogContent = ({
  formId,
  onRecord,
}: { formId: string; onRecord: (data: MedicationRecord[]) => void }) => {
  const [recordTime, setRecordTime] = useState(moment());
  const [schedule, setSchedule] = useState<MedicationRecord['schedule']>('adhoc');
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
  const [medications, setMedications] = useState<Record<string, string[]>>(EMPTY_MEDICATIONS);
  const [loadingMedications, setLoadingMedications] = useState(true);
  const [medicationsError, setMedicationsError] = useState<string | null>(null);
  const [gridRows, setGridRows] = useState<GridRowsProp>([]);

  useEffect(() => {
    let cancelled = false;
    setLoadingMedications(true);
    setMedicationsError(null);
    getMedicationDosageGroups().then((result) => {
      if (cancelled) return;
      if ('error' in result) {
        setMedicationsError(Array.isArray(result.error) ? result.error.join(', ') : result.error);
        setMedications(EMPTY_MEDICATIONS);
      } else {
        setMedications(result);
        setGridRows((result['adhoc'] ?? []).map((med) => ({ id: med, medication: med })));
      }
      setLoadingMedications(false);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setGridRows([...(medications[schedule] ?? []).map((med) => ({ id: med, medication: med }))]);
    setSelectedMedications([]);
  }, [schedule, medications]);

  const handleLocalSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const record = selectedMedications.map(selectedMedication => {
      let [medication, dosage] = selectedMedication.split(' - ');

      return { recordTime: recordTime.format('hh:mma'), medication, dosage, schedule };
    })

    onRecord(record);
  };

  return (
    <DialogContent sx={{ pt: 1 }}>
      <form onSubmit={handleLocalSubmit} id={formId}>
        <Container maxWidth="md" sx={{ marginTop: 2, marginBottom: 2, paddingLeft: 0, paddingRight: 0 }}>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr', // 1 column on extra small devices
                  md: '1fr 1fr' // 2 columns on medium and larger devices
                },
                gap: 2,
                alignItems: 'center'
              }}
            >
              <TimePicker
                name="recordTime"
                label="Time"
                value={recordTime}
                onChange={(newValue) => setRecordTime(newValue || moment())}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <Stack direction="row" spacing={1}>
                <Chip label="adhoc" size="small" color="primary" variant={schedule === 'adhoc' ? 'filled' : 'outlined'} onClick={() => setSchedule('adhoc')} />
                <Chip label="7am" size="small" color="primary" variant={schedule === '7am' ? 'filled' : 'outlined'} onClick={() => setSchedule('7am')} />
                <Chip label="3pm" size="small" color="primary" variant={schedule === '3pm' ? 'filled' : 'outlined'} onClick={() => setSchedule('3pm')} />
                <Chip label="7pm" size="small" color="primary" variant={schedule === '7pm' ? 'filled' : 'outlined'} onClick={() => setSchedule('7pm')} />
                <Chip label="10pm" size="small" color="primary" variant={schedule === '10pm' ? 'filled' : 'outlined'} onClick={() => setSchedule('10pm')} />
              </Stack>
            </Box>
          </LocalizationProvider>
        </Container>
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
          loading={loadingMedications}
          onRowSelectionModelChange={(newSelection) => setSelectedMedications(Array.from(newSelection.ids.values(), id => id.toString()))}
        />
        {medicationsError && (
          <Typography color="error" variant="caption" sx={{ mt: 1 }}>
            {medicationsError}
          </Typography>
        )}
      </form>
    </DialogContent>
  );
};
