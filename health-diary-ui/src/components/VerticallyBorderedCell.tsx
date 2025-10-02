import { styled } from '@mui/material/styles';
import TableCell from '@mui/material/TableCell';

export const VerticallyBorderedCell = styled(TableCell)(({ theme }) => ({
  borderLeft: `1px solid ${theme.palette.divider}`,
  borderRight: `1px solid ${theme.palette.divider}`,
}));
