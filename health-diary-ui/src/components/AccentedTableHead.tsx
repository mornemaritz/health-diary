import { styled } from '@mui/material/styles';
import TableHead from "@mui/material/TableHead";

export const AccentedTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  '& .MuiTableCell-head': {
    color: theme.palette.getContrastText(theme.palette.primary.light)
  },
}));