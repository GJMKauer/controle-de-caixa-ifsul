import { useEffect, useState } from "react";
import { Grid, Paper, Stack, Typography } from "@mui/material";
import { getAccounts, getDailySummary } from "../api/cashApi";
import CashSummaryCard from "../components/cash/CashSummaryCard";
import { Account, Summary } from "../types/cash";
import { formatCurrency, getTodayInputDate } from "../utils/formatters";

/** Dashboard com visão diária do caixa.
 * @returns Cartões de resumo e saldos de contas.
 */
export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [summary, setSummary] = useState<Summary>({
    balance: 0,
    movements: [],
    totalIncome: 0,
    totalOutcome: 0,
  });

  /** Carrega o resumo diário para a data atual. */
  const loadSummary = async (): Promise<void> => {
    const today = getTodayInputDate();
    const data = await getDailySummary(today);
    setSummary(data);
  };

  /** Carrega as contas com saldos. */
  const loadAccounts = async (): Promise<void> => {
    const data = await getAccounts();
    setAccounts(data);
  };

  useEffect(() => {
    void loadSummary();
    void loadAccounts();
  }, []);

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h5">Resumo do dia</Typography>
        <Typography color="text.secondary" variant="body2">
          Data: {getTodayInputDate()}
        </Typography>
      </Stack>
      <Grid container spacing={2}>
        <Grid item md={4} xs={12}>
          <CashSummaryCard subtitle="Entradas" value={summary.totalIncome} />
        </Grid>
        <Grid item md={4} xs={12}>
          <CashSummaryCard
            color="rgba(230, 126, 34, 1)"
            subtitle="Saídas"
            value={summary.totalOutcome}
          />
        </Grid>
        <Grid item md={4} xs={12}>
          <CashSummaryCard
            color="rgba(0, 184, 148, 1)"
            subtitle="Saldo"
            value={summary.balance}
          />
        </Grid>
      </Grid>
      <Paper sx={{ padding: 3 }}>
        <Stack spacing={1}>
          <Typography variant="h6">Saldos por conta</Typography>
          <Stack spacing={1}>
            {accounts.map((account) => (
              <Stack
                direction="row"
                justifyContent="space-between"
                key={account.id}
              >
                <Typography>{account.name}</Typography>
                <Typography fontWeight={600}>
                  {formatCurrency(account.currentBalance)}
                </Typography>
              </Stack>
            ))}
            {accounts.length === 0 ? (
              <Typography color="text.secondary" variant="body2">
                Nenhuma conta encontrada.
              </Typography>
            ) : null}
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
