import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Movement, MovementType } from "../../types/cash";
import { formatCurrency, formatDate } from "../../utils/formatters";

export interface CashTableProps {
  emptyMessage?: string;
  movements: Movement[];
}

/** Retorna o texto amigável para o tipo da movimentação.
 * @param type - Tipo da movimentação.
 * @returns Texto de label.
 */
const getTypeLabel = (type: MovementType): string =>
  type === "INCOME" ? "Entrada" : "Saída";

/** Tabela para listagem de movimentações.
 * @param props - Propriedades do componente.
 * @returns Tabela renderizada.
 */
export default function CashTable(props: CashTableProps) {
  const { emptyMessage = "Nenhuma movimentação encontrada", movements } = props;

  if (movements.length === 0) {
    return (
      <Paper sx={{ padding: 3 }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Data</TableCell>
            <TableCell>Descrição</TableCell>
            <TableCell>Conta</TableCell>
            <TableCell align="right">Valor</TableCell>
            <TableCell>Tipo</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {movements.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell>{formatDate(movement.date)}</TableCell>
              <TableCell>{movement.description}</TableCell>
              <TableCell>{movement.account}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                {formatCurrency(movement.amount)}
              </TableCell>
              <TableCell>
                <Chip
                  color={movement.type === "INCOME" ? "secondary" : "default"}
                  label={getTypeLabel(movement.type)}
                  size="small"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
