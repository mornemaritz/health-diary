import { Accordion, AccordionActions, AccordionDetails, AccordionSummary, Box, Button, Chip, Container, Paper, Stack, Table, TableBody, TableContainer, TableRow, Typography, CircularProgress, Alert } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BabyChangingStationIcon from '@mui/icons-material/BabyChangingStation';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import CommentIcon from '@mui/icons-material/Comment';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MedicationIcon from '@mui/icons-material/Medication';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import { ChevronLeft as PrevIcon, ChevronRight as NextIcon, Today as TodayIcon } from "@mui/icons-material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import { useCallback, useState, useEffect } from "react";
import { AccentedTableHead } from "../../components/AccentedTableHead";
import { VerticallyBorderedCell } from "../../components/VerticallyBorderedCell";
import { RecordBottleDialog } from "../../components/RecordBottleDialog";
import { RecordMedicationDialogContent, type MedicationRecord } from "../../components/RecordMedicationDialogContent";
import { RecordDialog } from "../../components/RecordDialog";
import { getDailySummary, createHydration, createMedication, convertScheduleToApiFormat, type DailySummaryResponse, type HealthEntrySet } from "../../services/healthRecordService";
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
  console.log('Summary component is rendering!');``
  const { isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState(moment());
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
    if (!isAuthenticated)  return;

    setIsLoading(true);
    setError(null);

    try {
      const dateStr = formatDateForApi(date);
      const result = await getDailySummary(dateStr);

      // Check if result has error property
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
    console.log('Selected date changed:', selectedDate.format('YYYY-MM-DD'), 'Is authenticated:', isAuthenticated);
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
   * Helper function to find an entry set by record type
   */
  const getEntrySet = (recordType: string): HealthEntrySet | undefined => {
    return summary?.healthEntrySets?.find(set => set.recordType === recordType);
  };

  /**
   * Map status from API to MUI chip color
   */
  const getChipColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    const statusMap: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      'success': 'success',
      'warning': 'warning',
      'error': 'error',
      'info': 'info',
      'primary': 'primary',
      'secondary': 'secondary',
    };
    return statusMap[status.toLowerCase()] || 'default';
  };

  return (
    <Box>
      <Container maxWidth="md" sx={{ marginTop: 2, marginBottom: 2 }}>
        <LocalizationProvider dateAdapter={AdapterMoment}>

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
                  xs: '1fr',
                  md: '1fr 1fr 1fr 1fr'
                },
                gap: 2,
                alignItems: 'center',
              }}
            >
              {/* Date Navigation */}
              <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center', alignItems: 'center' }}>
                <Button 
                  onClick={goToPreviousDay} 
                  variant="outlined" 
                  size="small"
                  sx={{ minWidth: '40px', p: '6px' }}
                >
                  <PrevIcon />
                </Button>
                <DatePicker
                  label={selectedDate.format('dddd')}
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue || moment())}
                  slotProps={{ 
                    textField: { 
                      size: 'small',
                      sx: { 
                        width: '145px',
                        '& .MuiOutlinedInput-input': {
                          padding: '8px 8px'
                        }
                      }
                    } 
                  }}
                />
                <Button 
                  onClick={goToNextDay} 
                  variant="outlined" 
                  size="small"
                  sx={{ minWidth: '40px', p: '6px' }}
                >
                  <NextIcon />
                </Button>
              </Stack>

              {/* Today Button */}
              <Stack sx={{  justifyContent: 'center' }}>
                <Button startIcon={<TodayIcon />} onClick={goToToday} variant="contained" size="small" sx={{ mx: 'auto' }}>
                  Today
                </Button>
              </Stack>
              <Stack direction="row" sx={{  justifyContent: 'center' }}>
                <Typography sx={{ px: 1, textAlign: { xs: 'left', md: 'center' } }}>Wake up time:</Typography>
                <Typography sx={{ px: 1, textAlign: { xs: 'left', md: 'center' } }}>
                  {selectedDate.isSame(moment(), 'day') ? 'Not set' : 'N/A'}
                </Typography>
              </Stack>
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
              <Typography component="span">Bottles</Typography>
              {(() => {
                const bottleSet = getEntrySet('BottleConsumption');
                return (
                  <>
                    {bottleSet?.highlights?.map((highlight, idx) => (
                      <Chip 
                        key={idx}
                        label={highlight.label} 
                        color={getChipColor(highlight.status)} 
                        size="small" 
                        sx={{ marginLeft: 1 }} 
                      />
                    ))}
                  </>
                );
              })()}
            </AccordionSummary>
            <AccordionDetails>
              {(() => {
                const bottleSet = getEntrySet('BottleConsumption');
                return bottleSet && bottleSet.records.length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 100 }} size="small" aria-label="bottle table">
                      <AccentedTableHead>
                        <TableRow>
                          <VerticallyBorderedCell>Time</VerticallyBorderedCell>
                          <VerticallyBorderedCell>Details</VerticallyBorderedCell>
                        </TableRow>
                      </AccentedTableHead>
                      <TableBody>
                        {bottleSet.records.map((record) => (
                          <TableRow key={record.id}>
                            <VerticallyBorderedCell component="th" scope="row">
                              {formatTimeDisplay(record.time)}
                            </VerticallyBorderedCell>
                            <VerticallyBorderedCell>{record.summary}</VerticallyBorderedCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No hydration records for this date
                  </Typography>
                );
              })()}
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
                {(() => {
                  const medicationSet = getEntrySet('MedicationAdministration');
                  return (
                    <>
                      {medicationSet?.highlights?.map((highlight, idx) => (
                        <Chip 
                          key={`highlight-${idx}`}
                          label={highlight.label} 
                          color={getChipColor(highlight.status)} 
                          size="small" 
                        />
                      ))}
                    </>
                  );
                })()}
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              {(() => {
                const medicationSet = getEntrySet('MedicationAdministration');
                return medicationSet && medicationSet.records.length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 100 }} size="small" aria-label="medication table">
                      <AccentedTableHead>
                        <TableRow>
                          <VerticallyBorderedCell>Time</VerticallyBorderedCell>
                          <VerticallyBorderedCell>Details</VerticallyBorderedCell>
                        </TableRow>
                      </AccentedTableHead>
                      <TableBody>
                        {medicationSet.records.map((record) => (
                          <TableRow key={record.id}>
                            <VerticallyBorderedCell component="th" scope="row">
                              {formatTimeDisplay(record.time)}
                            </VerticallyBorderedCell>
                            <VerticallyBorderedCell>{record.summary}</VerticallyBorderedCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No medication records for this date
                  </Typography>
                );
              })()}
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
              {(() => {
                const foodSet = getEntrySet('SolidFoodConsumption');
                return (
                  <>
                    {foodSet?.highlights?.map((highlight, idx) => (
                      <Chip 
                        key={idx}
                        label={highlight.label} 
                        color={getChipColor(highlight.status)} 
                        size="small" 
                        sx={{ marginLeft: 1 }} 
                      />
                    ))}
                  </>
                );
              })()}
            </AccordionSummary>
            <AccordionDetails>
              {(() => {
                const foodSet = getEntrySet('SolidFoodConsumption');
                return foodSet && foodSet.records.length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 100 }} size="small" aria-label="food table">
                      <AccentedTableHead>
                        <TableRow>
                          <VerticallyBorderedCell>Time</VerticallyBorderedCell>
                          <VerticallyBorderedCell>Details</VerticallyBorderedCell>
                        </TableRow>
                      </AccentedTableHead>
                      <TableBody>
                        {foodSet.records.map((record) => (
                          <TableRow key={record.id}>
                            <VerticallyBorderedCell component="th" scope="row">
                              {formatTimeDisplay(record.time)}
                            </VerticallyBorderedCell>
                            <VerticallyBorderedCell>{record.summary}</VerticallyBorderedCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No food records for this date
                  </Typography>
                );
              })()}
            </AccordionDetails>
            <AccordionActions>
              <Button variant="contained" size="small" onClick={() => alert('🚧 Under construction')}>Record Food</Button>
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
              {(() => {
                const bowelSet = getEntrySet('BowelMovement');
                return (
                  <>
                    {bowelSet?.highlights?.map((highlight, idx) => (
                      <Chip 
                        key={idx}
                        label={highlight.label} 
                        color={getChipColor(highlight.status)} 
                        size="small" 
                        sx={{ marginLeft: 1 }} 
                      />
                    ))}
                  </>
                );
              })()}
            </AccordionSummary>
            <AccordionDetails>
              {(() => {
                const bowelSet = getEntrySet('BowelMovement');
                return bowelSet && bowelSet.records.length > 0 ? (
                  <TableContainer component={Paper} sx={{ marginRight: 1 }}>
                    <Table sx={{ minWidth: 100 }} size="small" aria-label="bowel movement table">
                      <AccentedTableHead>
                        <TableRow>
                          <VerticallyBorderedCell>Time</VerticallyBorderedCell>
                          <VerticallyBorderedCell>Details</VerticallyBorderedCell>
                        </TableRow>
                      </AccentedTableHead>
                      <TableBody>
                        {bowelSet.records.map((record) => (
                          <TableRow key={record.id}>
                            <VerticallyBorderedCell component="th" scope="row">
                              {formatTimeDisplay(record.time)}
                            </VerticallyBorderedCell>
                            <VerticallyBorderedCell>{record.summary}</VerticallyBorderedCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No bowel movement records for this date
                  </Typography>
                );
              })()}
            </AccordionDetails>
            <AccordionActions>
              <Button variant="contained" size="small" onClick={() => alert('🚧 Under construction')}>Record Bowel Movement</Button>
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
              {(() => {
                const observationSet = getEntrySet('Observation');
                return (
                  <>
                    {observationSet?.highlights?.map((highlight, idx) => (
                      <Chip 
                        key={idx}
                        label={highlight.label} 
                        color={getChipColor(highlight.status)} 
                        size="small" 
                        sx={{ marginLeft: 1 }} 
                      />
                    ))}
                  </>
                );
              })()}
            </AccordionSummary>
            <AccordionDetails>
              {(() => {
                const observationSet = getEntrySet('Observation');
                return observationSet && observationSet.records.length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 100 }} size="small" aria-label="observations table">
                      <AccentedTableHead>
                        <TableRow>
                          <VerticallyBorderedCell>Time</VerticallyBorderedCell>
                          <VerticallyBorderedCell>Details</VerticallyBorderedCell>
                        </TableRow>
                      </AccentedTableHead>
                      <TableBody>
                        {observationSet.records.map((record) => (
                          <TableRow key={record.id}>
                            <VerticallyBorderedCell component="th" scope="row">
                              {formatTimeDisplay(record.time)}
                            </VerticallyBorderedCell>
                            <VerticallyBorderedCell>{record.summary}</VerticallyBorderedCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No observation records for this date
                  </Typography>
                );
              })()}
            </AccordionDetails>
            <AccordionActions>
              <Button variant="contained" size="small" onClick={() => alert('🚧 Under construction')}>Add Note</Button>
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
              {(() => {
                const noteSet = getEntrySet('Note');
                const sleepNote = noteSet?.records?.find((record) => record.summary.toLowerCase().includes('sleep'));
                return sleepNote?.summary || 'No sleep notes recorded';
              })()}
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </Box>
  );
};

export default Summary;
