import { Accordion, AccordionActions, AccordionDetails, AccordionSummary, Box, Button, Chip, Container, Paper, Stack, Table, TableBody, TableContainer, TableRow, Typography, CircularProgress, Alert } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BabyChangingStationIcon from '@mui/icons-material/BabyChangingStation';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import CommentIcon from '@mui/icons-material/Comment';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MedicationIcon from '@mui/icons-material/Medication';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import { ChevronLeft as PrevIcon, ChevronRight as NextIcon, Today as TodayIcon } from "@mui/icons-material";
import { DatePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import { useCallback, useState, useEffect } from "react";
import { AccentedTableHead } from "../../components/AccentedTableHead";
import { VerticallyBorderedCell } from "../../components/VerticallyBorderedCell";
import { RecordBottleDialog } from "../../components/RecordBottleDialog";
import { RecordMedicationDialogContent, type MedicationRecord } from "../../components/RecordMedicationDialogContent";
import { RecordDialog } from "../../components/RecordDialog";
import { getDailySummary, createHydration, createMedication, convertScheduleToApiFormat, type DailySummaryResponse } from "../../services/healthRecordService";
import { useAuth } from "../../hooks/useAuth";

/**
 * Format time string from HH:mm to hh:mma format
 */
function formatTimeDisplay(timeStr: string | undefined): string {
  if (!timeStr) return '';
  try {
    return moment(timeStr, ['HH:mm', 'HH:mm:ss']).format('hh:mma');
  } catch {
    return timeStr;
  }
}

const Summary: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState(moment());
  const [currentTime, setCurrentTime] = useState(moment());
  const [summary, setSummary] = useState<DailySummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [bottleRecordDialogOpen, setBottleRecordDialogOpen] = useState(false);
  const [medsRecordDialogOpen, setMedsRecordDialogOpen] = useState(false);

  /**
   * Format date to YYYY-MM-DD string for API
   */
  const formatDateForApi = (date: moment.Moment): string => {
    return date.format('YYYY-MM-DD');
  };

  /**
   * Load daily summary for selected date
   */
  const loadDailySummary = async (date: moment.Moment) => {
    if (!isAuthenticated) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const dateStr = formatDateForApi(date);
      const result = await getDailySummary(dateStr);

      if ('error' in result) {
        setError(result.error);
        setSummary(null);
      } else {
        setSummary(result);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load daily summary';
      setError(errorMsg);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load summary when date changes or authentication state changes
   */
  useEffect(() => {
    loadDailySummary(selectedDate);
  }, [selectedDate, isAuthenticated]);

  /**
   * Navigate to previous day
   */
  const goToPreviousDay = () => {
    const newDate = selectedDate.clone().subtract(1, 'day');
    setSelectedDate(newDate);
  };

  /**
   * Navigate to next day
   */
  const goToNextDay = () => {
    const newDate = selectedDate.clone().add(1, 'day');
    setSelectedDate(newDate);
  };

  /**
   * Jump to today
   */
  const goToToday = () => {
    setSelectedDate(moment());
  };

  /**
   * Handle recording a bottle
   */
  const handleRecordBottle = useCallback(async (data: { bottleTime: string; bottleSize: number }) => {
    try {
      const timeStr = moment(data.bottleTime).format('HH:mm');
      const result = await createHydration({
        date: formatDateForApi(selectedDate),
        time: timeStr,
        quantity: data.bottleSize,
      });

      if ('error' in result) {
        setError(result.error);
      } else {
        // Refresh the summary
        await loadDailySummary(selectedDate);
        setBottleRecordDialogOpen(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record bottle');
    }
  }, [selectedDate]);

  /**
   * Handle recording medications
   */
  const handleRecordMeds = useCallback(async (data: MedicationRecord[]) => {
    try {
      for (const med of data) {
        const timeStr = moment(med.recordTime, 'hh:mma').format('HH:mm');
        const result = await createMedication({
          date: formatDateForApi(selectedDate),
          time: timeStr,
          medication: med.medication,
          dosage: med.dosage,
          schedule: med.schedule ? convertScheduleToApiFormat(med.schedule) : undefined,
        });

        if ('error' in result) {
          setError(result.error);
          return;
        }
      }
      // Refresh the summary
      await loadDailySummary(selectedDate);
      setMedsRecordDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record medication');
    }
  }, [selectedDate]);

  const handleBottleRecordClickOpen = () => {
    setBottleRecordDialogOpen(true);
  };

  const handleBottleRecordClose = useCallback(() => {
    setBottleRecordDialogOpen(false);
  }, []);

  const handleMedsRecordClickOpen = () => {
    setMedsRecordDialogOpen(true);
  };

  const handleMedsRecordClose = useCallback(() => {
    setMedsRecordDialogOpen(false);
  }, []);

  /**
   * Group medications by time for chips display
   */
  const getMedicationTimeChips = (): Array<{ time: string; color: 'success' | 'primary' }> => {
    if (!summary?.medications || summary.medications.length === 0) {
      return [];
    }

    const times = new Set<string>();
    summary.medications.forEach((med) => {
      if (med.time) {
        const timeDisplay = formatTimeDisplay(med.time);
        times.add(timeDisplay);
      }
    });

    return Array.from(times).map((time) => ({
      time,
      color: time.includes('am') ? 'success' as const : 'primary' as const,
    }));
  };

  /**
   * Count bowel movements and get total quantity of bottles
   */
  const getBowelMovementCount = (): number => {
    return summary?.bowelMovements?.length || 0;
  };

  const getTotalBottleQuantity = (): number => {
    return (
      summary?.hydration?.reduce((total, record) => {
        return total + (record.quantity || 0);
      }, 0) || 0
    );
  };

  const getBottleCount = (): number => {
    return summary?.hydration?.length || 0;
  };

  return (
    <Box>
      <Container maxWidth="md" sx={{ marginTop: 2, marginBottom: 2 }}>
        <LocalizationProvider dateAdapter={AdapterMoment}>
          {/* Date Navigation */}
          <Stack direction="row" spacing={2} sx={{ mb: 3, justifyContent: 'center', alignItems: 'center' }}>
            <Button startIcon={<PrevIcon />} onClick={goToPreviousDay} variant="outlined" size="small">
              Previous
            </Button>
            <Typography sx={{ minWidth: '200px', textAlign: 'center', fontWeight: 600 }}>
              {selectedDate.format('dddd, MMMM Do YYYY')}
            </Typography>
            <Button endIcon={<NextIcon />} onClick={goToNextDay} variant="outlined" size="small">
              Next
            </Button>
          </Stack>

          {/* Today Button */}
          <Stack sx={{ mb: 3, justifyContent: 'center' }}>
            <Button startIcon={<TodayIcon />} onClick={goToToday} variant="contained" size="small" sx={{ mx: 'auto' }}>
              Today
            </Button>
          </Stack>

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Date and Time Pickers */}
          {!isLoading && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr 1fr',
                  md: '1fr 1fr 1fr 1fr'
                },
                gap: 2,
                alignItems: 'center',
                mb: 3
              }}
            >
              <DatePicker
                label={selectedDate.format('dddd')}
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue || moment())}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <TimePicker
                label="Time"
                value={currentTime}
                onChange={(newValue) => setCurrentTime(newValue || moment())}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <Typography sx={{ textAlign: { xs: 'left', md: 'center' } }}>Wake up time:</Typography>
              <Typography sx={{ textAlign: { xs: 'left', md: 'center' } }}>
                {selectedDate.isSame(moment(), 'day') ? 'Not set' : 'N/A'}
              </Typography>
            </Box>
          )}
        </LocalizationProvider>
      </Container>

      {/* Content - Only show when not loading */}
      {!isLoading && (
        <>
          {/* Bottles Section */}
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="bottles-panel-content"
              id="bottles-panel-header"
            >
              <LocalDrinkIcon color='primary' sx={{ marginRight: 1 }} />
              <Typography component="span">Hydration</Typography>
              {summary?.hydration && summary.hydration.length > 0 && (
                <Chip 
                  label={`${getBottleCount()} (${getTotalBottleQuantity()}ml)`} 
                  color="primary" 
                  size="small" 
                  sx={{ marginLeft: 1 }} 
                />
              )}
            </AccordionSummary>
            <AccordionDetails>
              {summary?.hydration && summary.hydration.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 100 }} size="small" aria-label="bottle table">
                    <AccentedTableHead>
                      <TableRow>
                        <VerticallyBorderedCell>Time</VerticallyBorderedCell>
                        <VerticallyBorderedCell>Details</VerticallyBorderedCell>
                      </TableRow>
                    </AccentedTableHead>
                    <TableBody>
                      {summary.hydration.map((row) => (
                        <TableRow key={row.id}>
                          <VerticallyBorderedCell component="th" scope="row">
                            {formatTimeDisplay(row.time)}
                          </VerticallyBorderedCell>
                          <VerticallyBorderedCell>{row.quantity || 0}ml</VerticallyBorderedCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No hydration records for this date
                </Typography>
              )}
            </AccordionDetails>
            <RecordBottleDialog open={bottleRecordDialogOpen} onClose={handleBottleRecordClose} onRecordBottle={handleRecordBottle} />
            <AccordionActions>
              <Button variant="contained" size="small" onClick={handleBottleRecordClickOpen}>Record Hydration</Button>
            </AccordionActions>
          </Accordion>

          {/* Medication Section */}
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="medication-panel-content"
              id="medication-panel-header"
            >
              <MedicationIcon color='primary' sx={{ marginRight: 1 }} />
              <Typography component="span" sx={{ marginRight: 1 }}>Medication</Typography>
              <Stack direction="row" spacing={1}>
                {getMedicationTimeChips().map((chip, idx) => (
                  <Chip key={idx} label={chip.time} size="small" color={chip.color} />
                ))}
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              {summary?.medications && summary.medications.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 100 }} size="small" aria-label="medication table">
                    <AccentedTableHead>
                      <TableRow>
                        <VerticallyBorderedCell>Time</VerticallyBorderedCell>
                        <VerticallyBorderedCell>Details</VerticallyBorderedCell>
                      </TableRow>
                    </AccentedTableHead>
                    <TableBody>
                      {summary.medications.map((row) => (
                        <TableRow key={row.id}>
                          <VerticallyBorderedCell component="th" scope="row">
                            {formatTimeDisplay(row.time)}
                          </VerticallyBorderedCell>
                          <VerticallyBorderedCell>{`${row.dosage || ''} ${row.medication || 'N/A'}`.trim()}</VerticallyBorderedCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No medication records for this date
                </Typography>
              )}
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

          {/* Food Section */}
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="solids-panel-content"
              id="solids-panel-header"
            >
              <RestaurantIcon color='primary' sx={{ marginRight: 1 }} />
              <Typography component="span">Food</Typography>
              {summary?.food && summary.food.length > 0 && (
                <Chip label={summary.food.length} color="primary" size="small" sx={{ marginLeft: 1 }} />
              )}
            </AccordionSummary>
            <AccordionDetails>
              {summary?.food && summary.food.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 100 }} size="small" aria-label="food table">
                    <AccentedTableHead>
                      <TableRow>
                        <VerticallyBorderedCell>Time</VerticallyBorderedCell>
                        <VerticallyBorderedCell>Details</VerticallyBorderedCell>
                      </TableRow>
                    </AccentedTableHead>
                    <TableBody>
                      {summary.food.map((row) => (
                        <TableRow key={row.id}>
                          <VerticallyBorderedCell component="th" scope="row">
                            {formatTimeDisplay(row.time)}
                          </VerticallyBorderedCell>
                          <VerticallyBorderedCell>{`${row.food || 'N/A'}${row.quantity ? ` (${row.quantity})` : ''}`.trim()}</VerticallyBorderedCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No food records for this date
                </Typography>
              )}
            </AccordionDetails>
            <AccordionActions>
              <Button variant="contained" size="small">Record Food</Button>
            </AccordionActions>
          </Accordion>

          {/* Bowel Movements Section */}
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="nappies-panel-content"
              id="nappies-panel-header"
            >
              <BabyChangingStationIcon color='primary' sx={{ marginRight: 1 }} />
              <Typography component="span">Bowel Movements</Typography>
              {getBowelMovementCount() > 0 && (
                <Chip label={`${getBowelMovementCount()}`} color="success" size="small" sx={{ marginLeft: 1 }} />
              )}
            </AccordionSummary>
            <AccordionDetails>
              {summary?.bowelMovements && summary.bowelMovements.length > 0 ? (
                <TableContainer component={Paper} sx={{ marginRight: 1 }}>
                  <Table sx={{ minWidth: 100 }} size="small" aria-label="bowel movement table">
                    <AccentedTableHead>
                      <TableRow>
                        <VerticallyBorderedCell>Time</VerticallyBorderedCell>
                        <VerticallyBorderedCell>Details</VerticallyBorderedCell>
                      </TableRow>
                    </AccentedTableHead>
                    <TableBody>
                      {summary.bowelMovements.map((row) => (
                        <TableRow key={row.id}>
                          <VerticallyBorderedCell component="th" scope="row">
                            {formatTimeDisplay(row.time)}
                          </VerticallyBorderedCell>
                          <VerticallyBorderedCell>{row.consistency || 'N/A'}</VerticallyBorderedCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No bowel movement records for this date
                </Typography>
              )}
            </AccordionDetails>
            <AccordionActions>
              <Button variant="contained" size="small">Record Bowel Movement</Button>
            </AccordionActions>
          </Accordion>

          {/* Notes Section */}
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="notes-panel-content"
              id="notes-panel-header"
            >
              <CommentIcon color='primary' sx={{ marginRight: 1 }} />
              <Typography component="span">Observations</Typography>
              {summary?.observations && summary.observations.length > 0 && (
                <Chip label={summary.observations.length} color="primary" size="small" sx={{ marginLeft: 1 }} />
              )}
            </AccordionSummary>
            <AccordionDetails>
              {summary?.observations && summary.observations.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 100 }} size="small" aria-label="observations table">
                    <AccentedTableHead>
                      <TableRow>
                        <VerticallyBorderedCell>Time</VerticallyBorderedCell>
                        <VerticallyBorderedCell>Details</VerticallyBorderedCell>
                      </TableRow>
                    </AccentedTableHead>
                    <TableBody>
                      {summary.observations.map((row) => (
                        <TableRow key={row.id}>
                          <VerticallyBorderedCell component="th" scope="row">
                            {formatTimeDisplay(row.time)}
                          </VerticallyBorderedCell>
                          <VerticallyBorderedCell>{row.notes || 'N/A'}</VerticallyBorderedCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No observation records for this date
                </Typography>
              )}
            </AccordionDetails>
            <AccordionActions>
              <Button variant="contained" size="small">Add Note</Button>
            </AccordionActions>
          </Accordion>

          {/* Night Sleep Section */}
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
              {summary?.observations?.find((o) => o.category === 'sleep')?.notes || 'No sleep notes recorded'}
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </Box>
  );
};

export default Summary;