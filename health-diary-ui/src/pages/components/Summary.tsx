import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Container, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
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
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <LocalDrinkIcon color='primary' sx={{ marginRight: 1 }} />
          <Typography component="span">Bottles</Typography>
          <Chip label="3 (180ml)" color="primary" size="small" sx={{ marginLeft: 1 }} />
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 100 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell align="right">Size (ml)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bottleRows.map((row) => (
                  <TableRow
                    key={row.time}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.time}
                    </TableCell>
                    <TableCell align="right">{row.size}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>          
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          <MedicationIcon color='primary' sx={{ marginRight: 1 }} />
          <Typography component="span" sx={{marginRight: 1}}>Medication</Typography>
          <Stack direction="row" spacing={1}>
            <Chip label="7am" size="small" color="success"/>
            <Chip label="3pm" size="small" color="warning"/>
            <Chip label="7pm" size="small" color="primary"/>
            <Chip label="10pm" size="small" color="primary"/>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          malesuada lacus ex, sit amet blandit leo lobortis eget.
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          <RestaurantIcon color='primary' sx={{ marginRight: 1 }} />
          <Typography component="span">Solids</Typography>
        </AccordionSummary>
        <AccordionDetails>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          malesuada lacus ex, sit amet blandit leo lobortis eget.
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          <BabyChangingStationIcon color='primary' sx={{ marginRight: 1 }} />
          <Typography component="span">Nappies</Typography>
          <Chip label="2 Poos" color="success" size="small" sx={{ marginLeft: 1 }} />
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper} sx={{ marginRight: 1 }}>
            <Table sx={{ minWidth: 100 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Consistency</TableCell>
                  <TableCell>Color</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {nappyRows.map((row) => (
                  <TableRow
                    key={row.time}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.time}
                    </TableCell>
                    <TableCell>{row.size}</TableCell>
                    <TableCell>{row.consistency}</TableCell>
                    <TableCell>{row.color}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>          
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          <CommentIcon color='primary' sx={{ marginRight: 1 }} />
          <Typography component="span">Notes</Typography>
        </AccordionSummary>
        <AccordionDetails>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          malesuada lacus ex, sit amet blandit leo lobortis eget.
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
        >
          <BedtimeIcon color='primary' sx={{ marginRight: 1 }} />
          <Typography component="span">How was the night?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          malesuada lacus ex, sit amet blandit leo lobortis eget.
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

export default Summary;
