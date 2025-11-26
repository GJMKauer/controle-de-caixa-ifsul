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
import { capitalize, formatCurrency, formatDate } from "../../utils/formatters";

export interface CashTableProps {
  accountNames?: Record<string, string>;
  emptyMessage?: string;
  movements: Array<Movement>;
}

/** Retorna o texto amigável para o tipo da movimentação.
 * @param type - Tipo da movimentação.
 * @returns Texto de label.
 */
const getTypeLabel = (type: MovementType): string => (type === "INCOME" ? "Entrada" : "Saída");

/** Tabela para listagem de movimentações.
 * @param accountNames - Mapeamento de nomes das contas.
 * @param emptyMessage - Mensagem exibida quando não há movimentações.
 * @param movements - Movimentações a serem exibidas.
 * @returns Tabela renderizada.
 */
export default function CashTable(props: CashTableProps) {
  const { accountNames, emptyMessage = "Nenhuma movimentação encontrada", movements } = props;

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
            <TableCell>Conta(s)</TableCell>
            <TableCell align="right">Valor</TableCell>
            <TableCell>Tipo</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {movements.map((movement) => {
            const accountLabel =
              movement.fromAccount && movement.toAccount
                ? `${accountNames?.[movement.fromAccount] ?? capitalize(movement.fromAccount)} → ${
                    accountNames?.[movement.toAccount] ?? capitalize(movement.toAccount)
                  }`
                : (accountNames?.[movement.account] ?? capitalize(movement.account));

            return (
              <TableRow key={movement.id}>
                <TableCell>{formatDate(movement.date)}</TableCell>
                <TableCell>{movement.description}</TableCell>
                <TableCell>{accountLabel}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {formatCurrency(movement.amount)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getTypeLabel(movement.type)}
                    size="small"
                    sx={{
                      backgroundColor: movement.type === "INCOME" ? "rgba(0, 184, 148, 1)" : "rgba(230, 126, 34, 1)",
                      color: "white",
                      minWidth: 80,
                      textAlign: "center",
                    }}
                    variant="filled"
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
