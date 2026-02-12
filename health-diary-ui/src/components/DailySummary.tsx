/**
 * DailySummary component
 * Displays all health records for a specific date organized by type
 */

import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Box,
  Typography,
  Chip,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import {
  LocalPharmacy as MedicationIcon,
  LocalDrink as HydrationIcon,
  RestartAlt as BowelMovementIcon,
  Restaurant as FoodIcon,
  Notes as ObservationIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material'
import type { DailySummaryResponse } from '../services/healthRecordService'

type DailySummaryProps = {
  summary: DailySummaryResponse
  date: Date
}

const DailySummary: React.FC<DailySummaryProps> = ({ summary, date }) => {
  const hasRecords =
    (summary.medications && summary.medications.length > 0) ||
    (summary.hydration && summary.hydration.length > 0) ||
    (summary.bowelMovements && summary.bowelMovements.length > 0) ||
    (summary.food && summary.food.length > 0) ||
    (summary.observations && summary.observations.length > 0)

  if (!hasRecords) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="textSecondary">
          No health records for {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Start recording your health data to see it appear here
        </Typography>
      </Box>
    )
  }

  const formatTime = (time: string) => {
    try {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    } catch {
      return time
    }
  }

  const RecordSection = ({
    title,
    icon: Icon,
    records,
    defaultExpanded = true,
    children,
  }: {
    title: string
    icon: React.ComponentType<any>
    records?: Array<any>
    defaultExpanded?: boolean
    children: React.ReactNode
  }) => {
    if (!records || records.length === 0) return null

    return (
      <Accordion defaultExpanded={defaultExpanded} sx={{ mb: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Icon sx={{ mr: 1, display: 'flex', alignItems: 'center' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Chip
            label={records.length}
            size="small"
            sx={{ ml: 'auto' }}
            color="primary"
            variant="outlined"
          />
        </AccordionSummary>
        <AccordionDetails>{children}</AccordionDetails>
      </Accordion>
    )
  }

  return (
    <Card>
      <CardHeader
        title="Daily Summary"
        subheader={date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      />
      <CardContent>
        <Stack spacing={0}>
          {/* Medications Section */}
          <RecordSection
            title="Medications"
            icon={MedicationIcon}
            records={summary.medications}
          >
            <List dense>
              {summary.medications?.map((med) => (
                <ListItem key={med.id}>
                  <ListItemText
                    primary={med.medication || 'Unnamed medication'}
                    secondary={
                      <>
                        <Typography variant="caption" display="block">
                          {formatTime(med.time)}
                        </Typography>
                        {med.dosage && (
                          <Typography variant="caption" display="block">
                            Dosage: {med.dosage}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </RecordSection>

          {/* Hydration Section */}
          <RecordSection
            title="Hydration"
            icon={HydrationIcon}
            records={summary.hydration}
            defaultExpanded={false}
          >
            <List dense>
              {summary.hydration?.map((water) => (
                <ListItem key={water.id}>
                  <ListItemText
                    primary={`${water.quantity || 0} ml`}
                    secondary={
                      <Typography variant="caption" display="block">
                        {formatTime(water.time)}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </RecordSection>

          {/* Bowel Movement Section */}
          <RecordSection
            title="Bowel Movements"
            icon={BowelMovementIcon}
            records={summary.bowelMovements}
            defaultExpanded={false}
          >
            <List dense>
              {summary.bowelMovements?.map((bm) => (
                <ListItem key={bm.id}>
                  <ListItemText
                    primary={bm.consistency || 'Unknown'}
                    secondary={
                      <Typography variant="caption" display="block">
                        {formatTime(bm.time)}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </RecordSection>

          {/* Food Section */}
          <RecordSection
            title="Food"
            icon={FoodIcon}
            records={summary.food}
            defaultExpanded={false}
          >
            <List dense>
              {summary.food?.map((food) => (
                <ListItem key={food.id}>
                  <ListItemText
                    primary={food.food || 'Unnamed food'}
                    secondary={
                      <>
                        <Typography variant="caption" display="block">
                          {formatTime(food.time)}
                        </Typography>
                        {food.quantity && (
                          <Typography variant="caption" display="block">
                            Quantity: {food.quantity}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </RecordSection>

          {/* Observations Section */}
          <RecordSection
            title="Observations"
            icon={ObservationIcon}
            records={summary.observations}
            defaultExpanded={false}
          >
            <List dense>
              {summary.observations?.map((obs) => (
                <ListItem key={obs.id}>
                  <ListItemText
                    primary={obs.category || 'Note'}
                    secondary={
                      <>
                        <Typography variant="caption" display="block">
                          {formatTime(obs.time)}
                        </Typography>
                        {obs.notes && (
                          <Typography variant="body2" display="block" sx={{ mt: 0.5 }}>
                            {obs.notes}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </RecordSection>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default DailySummary
