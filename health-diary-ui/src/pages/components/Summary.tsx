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
import { useState } from "react";
import { AccentedTableHead } from "../../components/AccentedTableHead";
import { VerticallyBorderedCell } from "../../components/VerticallyBorderedCell";

const bottleRows = [
  createBottleData('07:00am', 60),
  createBottleData('08:00am', 60),
  createBottleData('09:00am', 60),
];

function createBottleData(
  time: string,
  size: number,
) {
  return { time, size };
}

const nappyRows = [
  createNappyData('07:00am', 'small', 'loose', 'yellow'),
  createNappyData('09:00am', 'large', 'puddle', 'brown'),
];

function createNappyData(time: string, size: string, consistency: string, color: string) {
  return { time, size, consistency, color };
}

const sevenAmMedicationRows = [
  createMedicationData('Epilim', '4ml'),
  createMedicationData('Gapapentin', '300mg'),
  createMedicationData('Risperidone', '0.5mg'),
  createMedicationData('Nexium', '10mg'),
  createMedicationData('Movicol', '0.5 sachet'),
  createMedicationData('Hyfibre', '15ml'),
  createMedicationData('Purmycin (125)', '3.2ml'),
  createMedicationData('Panado', '10ml'),
];

const threePmMedicationRows = [
  createMedicationData('Epilim', '4ml'),
  createMedicationData('Gapapentin', '300mg'),
  createMedicationData('Movicol', '0.5 sachet'),
  createMedicationData('Hyfibre', '15ml'),
  createMedicationData('Purmycin (125)', '3.2ml'),
];

function createMedicationData(medication: string, dosage: string) {
  return { medication, dosage };
}

const Summary: React.FC = () => {
  const [day, setDate] = useState(moment());
  const [currentTime, setCurrentTime] = useState(moment());
  return (
    <Box>
      <Container sx={{ marginTop: 2, marginBottom: 2, display: 'flex', justifyContent: 'center', maxWidth: 400 }}>
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <DatePicker 
            label={day.format('dddd')}
            value={day} 
            onChange={(newValue) => setDate(newValue || moment())} 
            sx={{ marginRight: 2 }}
          />
          <TimePicker
            label="Time"
            value={currentTime}
            onChange={(newValue) => setCurrentTime(newValue || moment())}
          />
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
                {bottleRows.map((row) => (
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
        <AccordionActions>
          <Button variant="contained" size="small">Record Bottle</Button>
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
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="medication-7am-panel-content"
              id="medication-7am-panel-header"
            >
            <Typography component="span" sx={{marginRight: 1}}>7am</Typography>
              <Chip label="07:30" size="small" color="success"/>
            </AccordionSummary>
            <AccordionDetails>
            </AccordionDetails>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 100 }} size="small" aria-label="seven am meds table">
                <AccentedTableHead>
                  <TableRow>
                    <VerticallyBorderedCell>Medication</VerticallyBorderedCell>
                    <VerticallyBorderedCell align="right">Dosage</VerticallyBorderedCell>
                  </TableRow>
                </AccentedTableHead>
                <TableBody>
                  {sevenAmMedicationRows.map((row) => (
                    <TableRow key={row.medication}>
                      <VerticallyBorderedCell component="th" scope="row">
                        {row.medication}
                      </VerticallyBorderedCell>
                      <VerticallyBorderedCell align="right">{row.dosage}</VerticallyBorderedCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>          
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="medication-3pm-panel-content"
              id="medication-3pm-panel-header"
            >
            <Typography component="span" sx={{marginRight: 1}}>3pm</Typography>
              <Chip label="15:15" size="small" color="success"/>
            </AccordionSummary>
            <AccordionDetails>
            </AccordionDetails>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 100 }} size="small" aria-label="three pm meds table">
                <AccentedTableHead>
                  <TableRow>
                    <VerticallyBorderedCell>Medication</VerticallyBorderedCell>
                    <VerticallyBorderedCell align="right">Dosage</VerticallyBorderedCell>
                  </TableRow>
                </AccentedTableHead>
                <TableBody>
                  {threePmMedicationRows.map((row) => (
                    <TableRow key={row.medication}>
                      <VerticallyBorderedCell component="th" scope="row">
                        {row.medication}
                      </VerticallyBorderedCell>
                      <VerticallyBorderedCell align="right">{row.dosage}</VerticallyBorderedCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>          
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="medication-7pm-panel-content"
              id="medication-7pm-panel-header"
            >
              <Typography component="span" sx={{marginRight: 1}}>7pm</Typography>
            </AccordionSummary>
            <AccordionActions>
              <Button variant="contained" size="small">Record 7pm Meds</Button>
            </AccordionActions>
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="medication-10pm-panel-content"
              id="medication-10pm-panel-header"
            >
              <Typography component="span" sx={{marginRight: 1}}>10pm</Typography>
            </AccordionSummary>
            <AccordionActions>
              <Button variant="contained" size="small">Record 10pm Meds</Button>
            </AccordionActions>
          </Accordion>
        </AccordionDetails>
        <AccordionActions>
          <Button variant="contained" size="small">Record Ad-hoc Meds</Button>
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
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          malesuada lacus ex, sit amet blandit leo lobortis eget.
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
                {nappyRows.map((row) => (
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
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          malesuada lacus ex, sit amet blandit leo lobortis eget.
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
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          malesuada lacus ex, sit amet blandit leo lobortis eget.
        </AccordionDetails>
        <AccordionActions>
          <Button variant="contained" size="small">Add Night Report</Button>
        </AccordionActions>
      </Accordion>
    </Box>
  )
}

export default Summary;
