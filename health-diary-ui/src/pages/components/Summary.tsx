import { Accordion, AccordionActions, AccordionDetails, AccordionSummary, Box, Button, Chip, Container, Paper, Stack, Table, TableBody, TableContainer, TableRow, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BabyChangingStationIcon from '@mui/icons-material/BabyChangingStation';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import CommentIcon from '@mui/icons-material/Comment';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MedicationIcon from '@mui/icons-material/Medication';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import { DatePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import { useCallback, useState } from "react";
import { AccentedTableHead } from "../../components/AccentedTableHead";
import { VerticallyBorderedCell } from "../../components/VerticallyBorderedCell";
import { RecordBottleDialog } from "../../components/RecordBottleDialog";
import { RecordMedicationDialogContent, type MedicationRecord } from "../../components/RecordMedicationDialogContent";
import { RecordDialog } from "../../components/RecordDialog";

interface BottleRecord {
  time: string;
  size: number;
}

interface NappyRecord {
  time: string;
  size: string;
  consistency: string;
  color: string;
}

interface SolidRecord {
  time: string;
  item: string;
  size: string;
  notes: string;
}

interface NoteRecord {
  time: string;
  note: string;
}

const bottleRows = [
  createBottleData('07:00am', 60),
  createBottleData('08:00am', 60),
  createBottleData('09:00am', 60),
];

function createBottleData(time: string, size: number): BottleRecord {
  return { time, size };
}

const nappyRows = [
  createNappyData('07:00am', 'small', 'loose', 'yellow'),
  createNappyData('09:00am', 'large', 'puddle', 'brown'),
];

function createNappyData(time: string, size: string, consistency: string, color: string): NappyRecord {
  return { time, size, consistency, color };
}

const solidRows = [
  createSolidData('08:00am', 'Porridge', 'medium', 'ate 75%'),
  createSolidData('12:00pm', 'Pizza & Pesto', 'large', 'ate 75%'),
];

function createSolidData(time: string, item: string, size: string, notes: string): SolidRecord {
  return { time, item, size, notes };
}

const noteRows = [
  createNoteData('07:00am', 'Woke up happy'),
  createNoteData('09:00am', 'Played nicely with toys'),
];

function createNoteData(time: string, note: string): NoteRecord {
  return { time, note };
}

const sevenAmMedicationRows = [
  createMedicationData('07:00am', 'Epilim', '4ml', '7am'),
  createMedicationData('07:00am', 'Gabapentin', '300mg', '7am'),
  createMedicationData('07:00am', 'Risperidone', '0.5mg', '7am'),
  createMedicationData('07:00am', 'Nexium', '10mg', '7am'),
  createMedicationData('07:00am', 'Movicol', '0.5 sachet', '7am'),
  createMedicationData('07:00am', 'Hyfibre', '15ml', '7am'),
  createMedicationData('07:00am', 'Purmycin (125)', '3.2ml', '7am'),
  createMedicationData('07:00am', 'Panado', '10ml', '7am'),
];

const threePmMedicationRows = [
  createMedicationData('03:00pm', 'Epilim', '4ml', '3pm'),
  createMedicationData('03:00pm', 'Gabapentin', '300mg', '3pm'),
  createMedicationData('03:00pm', 'Movicol', '0.5 sachet', '3pm'),
  createMedicationData('03:00pm', 'Hyfibre', '15ml', '3pm'),
  createMedicationData('03:00pm', 'Purmycin (125)', '3.2ml', '3pm'),
];

function createMedicationData(recordTime: string, medication: string, dosage: string, schedule: '7am' | '3pm' | '7pm' | '10pm' | 'adhoc'): MedicationRecord {
  return { recordTime, medication, dosage, schedule };
}

const Summary: React.FC = () => {
  const [day, setDate] = useState(moment());
  const [currentTime, setCurrentTime] = useState(moment());
  const [bottleRowsState, setBottleRowsState] = useState(bottleRows);
  const [medicationRowsState, setMedicationRowsState] = useState([...sevenAmMedicationRows, ...threePmMedicationRows]);
  const [nappyRowsState] = useState(nappyRows);
  const [solidRowsState] = useState(solidRows);
  const [noteRowsState] = useState(noteRows);
  const [bottleRecordDialogOpen, setBottleRecordDialogOpen] = useState(false);
  const [medsRecordDialogOpen, setMedsRecordDialogOpen] = useState(false);

  const handleRecordBottle = useCallback((data: { bottleTime: string; bottleSize: number }) => {
    const newBottle = createBottleData(
      moment(data.bottleTime).format('hh:mma'),
      data.bottleSize
    );
    setBottleRowsState(prevRows => [...prevRows, newBottle]);
  }, []);

  const handleBottleRecordClickOpen = () => {
    setBottleRecordDialogOpen(true);
  };

  const handleBottleRecordClose = useCallback(() => {
    setBottleRecordDialogOpen(false);
  }, []);

  const handleMedsRecordClickOpen = () => {
    setMedsRecordDialogOpen(true);
  };

  const handleRecordMeds = useCallback((data: MedicationRecord[]) => {
    setMedicationRowsState(prev => [...prev, ...data]);
  }, []);

  const handleMedsRecordClose = useCallback(() => {
    setMedsRecordDialogOpen(false);
  }, []);

  return (
    <Box>
      <Container maxWidth="md" sx={{ marginTop: 2, marginBottom: 2 }}>
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr 1fr', // 2 columns on extra small devices
                md: '1fr 1fr 1fr 1fr' // 4 columns on medium and larger devices
              },
              gap: 2,
              alignItems: 'center'
            }}
          >
            <DatePicker 
              label={day.format('dddd')}
              value={day} 
              onChange={(newValue) => setDate(newValue || moment())}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <TimePicker
              label="Time"
              value={currentTime}
              onChange={(newValue) => setCurrentTime(newValue || moment())}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <Typography sx={{ textAlign: { xs: 'left', md: 'center' } }}>Wake up time:</Typography>
            <Typography sx={{ textAlign: { xs: 'left', md: 'center' } }}>06h45</Typography>
          </Box>
        </LocalizationProvider>
      </Container>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="bottles-panel-content"
          id="bottles-panel-header"
        >
          <LocalDrinkIcon color='primary' sx={{ marginRight: 1 }} />
          <Typography component="span">Bottles</Typography>
          <Chip label="3 (180ml)" color="primary" size="small" sx={{ marginLeft: 1 }} />
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 100 }} size="small" aria-label="bottle table">
              <AccentedTableHead>
                <TableRow>
                  <VerticallyBorderedCell>Time</VerticallyBorderedCell>
                  <VerticallyBorderedCell align="right">Size (ml)</VerticallyBorderedCell>
                </TableRow>
              </AccentedTableHead>
              <TableBody>
                {bottleRowsState.map((row) => (
                  <TableRow key={row.time}>
                    <VerticallyBorderedCell component="th" scope="row">
                      {row.time}
                    </VerticallyBorderedCell>
                    <VerticallyBorderedCell align="right">{row.size}</VerticallyBorderedCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
        <RecordBottleDialog open={bottleRecordDialogOpen} onClose={handleBottleRecordClose} onRecordBottle={handleRecordBottle} />
        <AccordionActions>
          <Button variant="contained" size="small" onClick={handleBottleRecordClickOpen}>Record Bottle</Button>
        </AccordionActions>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="medication-panel-content"
          id="medication-panel-header"
        >
          <MedicationIcon color='primary' sx={{ marginRight: 1 }} />
          <Typography component="span" sx={{marginRight: 1}}>Medication</Typography>
          <Stack direction="row" spacing={1}>
            <Chip label="7am" size="small" color="success"/>
            <Chip label="3pm" size="small" color="success"/>
            <Chip label="7pm" size="small" color="primary"/>
            <Chip label="10pm" size="small" color="primary"/>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 100 }} size="small" aria-label="medication table">
              <AccentedTableHead>
                <TableRow>
                  <VerticallyBorderedCell>Time</VerticallyBorderedCell>
                  <VerticallyBorderedCell>Medication</VerticallyBorderedCell>
                  <VerticallyBorderedCell>Schedule</VerticallyBorderedCell>
                </TableRow>
              </AccentedTableHead>
              <TableBody>
                {medicationRowsState.map((row) => (
                  <TableRow key={`${row.recordTime}-${row.medication}`}>
                    <VerticallyBorderedCell component="th" scope="row">
                      {row.recordTime}
                    </VerticallyBorderedCell>
                    <VerticallyBorderedCell>{`${row.medication} (${row.dosage})`}</VerticallyBorderedCell>
                    <VerticallyBorderedCell>{row.schedule}</VerticallyBorderedCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
        <AccordionActions>
      <RecordDialog<MedicationRecord[]>
        open={medsRecordDialogOpen}
        onClose={handleMedsRecordClose}
        onRecord={handleRecordMeds}
        formId="medication-form"
        title="Record Medication"
        ContentComponent={RecordMedicationDialogContent}
      />
          <Button variant="contained" size="small" onClick={handleMedsRecordClickOpen}>Record Medication</Button>
        </AccordionActions>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="solids-panel-content"
          id="solids-panel-header"
        >
          <RestaurantIcon color='primary' sx={{ marginRight: 1 }} />
          <Typography component="span">Solids</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 100 }} size="small" aria-label="solids table">
              <AccentedTableHead>
                <TableRow>
                  <VerticallyBorderedCell>Time</VerticallyBorderedCell>
                  <VerticallyBorderedCell>Item</VerticallyBorderedCell>
                  <VerticallyBorderedCell>Size</VerticallyBorderedCell>
                  <VerticallyBorderedCell>Notes</VerticallyBorderedCell>
                </TableRow>
              </AccentedTableHead>
              <TableBody>
                {solidRowsState.map((row) => (
                  <TableRow key={row.time}>
                    <VerticallyBorderedCell component="th" scope="row">
                      {row.time}
                    </VerticallyBorderedCell>
                    <VerticallyBorderedCell>{row.item}</VerticallyBorderedCell>
                    <VerticallyBorderedCell>{row.size}</VerticallyBorderedCell>
                    <VerticallyBorderedCell>{row.notes}</VerticallyBorderedCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
        <AccordionActions>
          <Button variant="contained" size="small">Record Solids</Button>
        </AccordionActions>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="nappies-panel-content"
          id="nappies-panel-header"
        >
          <BabyChangingStationIcon color='primary' sx={{ marginRight: 1 }} />
          <Typography component="span">Nappies</Typography>
          <Chip label="2 Poos" color="success" size="small" sx={{ marginLeft: 1 }} />
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper} sx={{ marginRight: 1 }}>
            <Table sx={{ minWidth: 100 }} size="small" aria-label="nappy table">
              <AccentedTableHead>
                <TableRow>
                  <VerticallyBorderedCell>Time</VerticallyBorderedCell>
                  <VerticallyBorderedCell>Size</VerticallyBorderedCell>
                  <VerticallyBorderedCell>Consistency</VerticallyBorderedCell>
                  <VerticallyBorderedCell>Color</VerticallyBorderedCell>
                </TableRow>
              </AccentedTableHead>
              <TableBody>
                {nappyRowsState.map((row) => (
                  <TableRow key={row.time}>
                    <VerticallyBorderedCell component="th" scope="row">
                      {row.time}
                    </VerticallyBorderedCell>
                    <VerticallyBorderedCell>{row.size}</VerticallyBorderedCell>
                    <VerticallyBorderedCell>{row.consistency}</VerticallyBorderedCell>
                    <VerticallyBorderedCell>{row.color}</VerticallyBorderedCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>          
        </AccordionDetails>
        <AccordionActions>
          <Button variant="contained" size="small">Record Nappy</Button>
        </AccordionActions>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="notes-panel-content"
          id="notes-panel-header"
        >
          <CommentIcon color='primary' sx={{ marginRight: 1 }} />
          <Typography component="span">Notes</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 100 }} size="small" aria-label="notes table">
              <AccentedTableHead>
                <TableRow>
                  <VerticallyBorderedCell>Time</VerticallyBorderedCell>
                  <VerticallyBorderedCell>Note</VerticallyBorderedCell>
                </TableRow>
              </AccentedTableHead>
              <TableBody>
                {noteRowsState.map((row) => (
                  <TableRow key={row.time}>
                    <VerticallyBorderedCell component="th" scope="row">
                      {row.time}
                    </VerticallyBorderedCell>
                    <VerticallyBorderedCell>{row.note}</VerticallyBorderedCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
        <AccordionActions>
          <Button variant="contained" size="small">Add Note</Button>
        </AccordionActions>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="nights-panel-content"
          id="nights-panel-header"
        >
          <BedtimeIcon color='primary' sx={{ marginRight: 1 }} />
          <Typography component="span">How was the night?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          Had a good night! Slept through until 5am. Asked for mommy from then on. Had 3 bottles
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default Summary;