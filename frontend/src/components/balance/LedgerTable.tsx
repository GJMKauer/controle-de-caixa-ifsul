import React from "react";
import { Box, TableCell, TableRow, Typography } from "@mui/material";
import { BalanceLine } from "../../types/cash";
import { formatCurrency } from "../../utils/formatters";

export interface LedgerEntry {
  amount: number;
  description: string;
  id: string;
}

export interface LedgerTableProps {
  accentColor: string;
  expanded: boolean;
  hideDepColumns?: boolean;
  ledger: { credits: Array<LedgerEntry>; debits: Array<LedgerEntry> };
  line: BalanceLine;
  onToggle: () => void;
}

/** Linha de tabela com razonete expandível.
 * @param accentColor Cor de destaque do razonete.
 * @param expanded Indica se o razonete está expandido.
 * @param hideDepColumns Indica se as colunas de depreciação devem ser ocultadas.
 * @param ledger Razonete com débitos e créditos.
 * @param line Linha do balanço associada ao razonete.
 * @param onToggle Função chamada ao clicar para expandir/contrair o razonete.
 * @returns Linha e razonete renderizados.
 */
export default function LedgerTable(props: LedgerTableProps): JSX.Element {
  const { accentColor, expanded, hideDepColumns = false, ledger, line, onToggle } = props;

  const colSpan = hideDepColumns ? 3 : 5;
  const debitEntries = ledger.debits.filter((entry) => entry.id !== "SF");
  const creditEntries = ledger.credits.filter((entry) => entry.id !== "SF");
  const debitSf = ledger.debits.find((entry) => entry.id === "SF");
  const creditSf = ledger.credits.find((entry) => entry.id === "SF");
  const rowCount = Math.max(debitEntries.length + (debitSf ? 1 : 0), creditEntries.length + (creditSf ? 1 : 0));
  const finalRowIndex = Math.max(rowCount - 1, 0);
  const debitRows: Array<LedgerEntry | undefined> = Array.from({ length: rowCount });
  const creditRows: Array<LedgerEntry | undefined> = Array.from({ length: rowCount });

  debitEntries.forEach((entry, index) => {
    debitRows[index] = entry;
  });
  creditEntries.forEach((entry, index) => {
    creditRows[index] = entry;
  });
  if (debitSf) {
    debitRows[finalRowIndex] = debitSf;
  }
  if (creditSf) {
    creditRows[finalRowIndex] = creditSf;
  }

  return (
    <React.Fragment>
      <TableRow hover onClick={onToggle} sx={{ cursor: "pointer" }}>
        <TableCell>{line.accountName}</TableCell>
        <TableCell align="right">{formatCurrency(line.totalCost)}</TableCell>
        {!hideDepColumns ? <TableCell align="right">{formatCurrency(line.depreciation)}</TableCell> : null}
        {!hideDepColumns ? <TableCell align="right">{line.rate ? `${line.rate}%` : "-"}</TableCell> : null}
        <TableCell align="right" sx={{ fontWeight: 600 }}>
          {formatCurrency(line.netValue)}
        </TableCell>
      </TableRow>
      {expanded ? (
        <TableRow>
          <TableCell colSpan={colSpan} sx={{ paddingBottom: 2 }}>
            <Box
              sx={{
                border: `1px solid ${accentColor}`,
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  backgroundColor: "rgba(0,0,0,0.03)",
                  borderBottom: `1px solid ${accentColor}`,
                  display: "grid",
                  fontWeight: 600,
                  gridTemplateColumns: "2fr 1fr 1fr 2fr",
                  padding: 0.5,
                }}
              >
                <Typography variant="body2">Débitos</Typography>
                <Typography variant="body2" />
                <Typography variant="body2" />
                <Typography sx={{ textAlign: "right" }} variant="body2">
                  Créditos
                </Typography>
              </Box>
              <Box
                sx={{
                  borderBottom: `1px solid ${accentColor}`,
                  display: "grid",
                  fontWeight: 600,
                  gridTemplateColumns: "2fr 1fr 1fr 2fr",
                  padding: 0.5,
                }}
              >
                <Typography variant="body2">Descrição</Typography>
                <Typography sx={{ textAlign: "right" }} variant="body2">
                  Valor
                </Typography>
                <Typography sx={{ textAlign: "right" }} variant="body2">
                  Valor
                </Typography>
                <Typography sx={{ textAlign: "right" }} variant="body2">
                  Descrição
                </Typography>
              </Box>
              {Array.from({ length: rowCount }, (_item, index) => {
        const debitEntry = debitRows[index];
        const creditEntry = creditRows[index];
        const debitLabel = debitEntry ? `${debitEntry.id} ${debitEntry.description}` : "";
        const creditLabel = creditEntry ? `${creditEntry.id} ${creditEntry.description}` : "";
        const isDebitSf = debitEntry?.id === "SF";
        const isCreditSf = creditEntry?.id === "SF";
        const debitAmount = isDebitSf ? line.netValue : debitEntry?.amount;
        const creditAmount = isCreditSf ? line.netValue : creditEntry?.amount;

        return (
          <Box
            key={`${line.accountId}-${index}`}
            sx={{
                      borderBottom: `1px solid ${accentColor}`,
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 1fr 2fr",
                      padding: 0.5,
                    }}
                  >
                    <Typography sx={{ fontWeight: isDebitSf ? 700 : 400 }} variant="body2">
                      {debitLabel}
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: isDebitSf ? 700 : 400,
                        textAlign: "right",
                      }}
                      variant="body2"
                    >
                      {debitEntry && debitAmount !== undefined ? formatCurrency(debitAmount) : ""}
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: isCreditSf ? 700 : 400,
                        textAlign: "right",
                      }}
                      variant="body2"
                    >
                      {creditEntry && creditAmount !== undefined ? formatCurrency(creditAmount) : ""}
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: isCreditSf ? 700 : 400,
                        textAlign: "right",
                      }}
                      variant="body2"
                    >
                      {creditLabel}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </TableCell>
        </TableRow>
      ) : null}
    </React.Fragment>
  );
}
