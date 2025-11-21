import { useEffect, useState } from "react";
import { Grid, Stack, Typography } from "@mui/material";
import { getPeriodSummary, MovementFilters } from "../api/cashApi";
import CashFilters from "../components/cash/CashFilters";
import CashSummaryCard from "../components/cash/CashSummaryCard";
import CashTable from "../components/cash/CashTable";
import { Summary } from "../types/cash";

/** Página de relatórios por período.
 * @returns Seções de filtros, resumo e listagem.
 */
export default function ReportsPage() {
  const [filters, setFilters] = useState<MovementFilters>({});
  const [summary, setSummary] = useState<Summary>({
    balance: 0,
    movements: [],
    totalIncome: 0,
    totalOutcome: 0,
  });

  /** Consulta resumo de acordo com o período informado.
   * @param currentFilters - Intervalo de datas.
   */
  const loadSummary = async (
    currentFilters?: MovementFilters
  ): Promise<void> => {
    const data = await getPeriodSummary(
      currentFilters?.from,
      currentFilters?.to
    );
    setSummary(data);
  };

  /** Manipula a submissão do filtro de período.
   * @param newFilters - Período selecionado.
   */
  const handleFilters = async (newFilters: MovementFilters): Promise<void> => {
    setFilters(newFilters);
    await loadSummary(newFilters);
  };

  useEffect(() => {
    void loadSummary(filters);
  }, []);

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ md: "row", xs: "column" }}
        justifyContent="space-between"
        spacing={2}
      >
        <Stack spacing={0.5}>
          <Typography variant="h5">Relatórios</Typography>
          <Typography color="text.secondary" variant="body2">
            Consulte o saldo de um dia específico ou de um intervalo.
          </Typography>
        </Stack>
        <CashFilters
          defaultFrom={filters.from}
          defaultTo={filters.to}
          onApply={handleFilters}
        />
      </Stack>
      <Grid container spacing={2}>
        <Grid item md={4} xs={12}>
          <CashSummaryCard
            subtitle="Entradas no período"
            value={summary.totalIncome}
          />
        </Grid>
        <Grid item md={4} xs={12}>
          <CashSummaryCard
            color="rgba(230, 126, 34, 1)"
            subtitle="Saídas no período"
            value={summary.totalOutcome}
          />
        </Grid>
        <Grid item md={4} xs={12}>
          <CashSummaryCard
            color="rgba(0, 184, 148, 1)"
            subtitle="Saldo final"
            value={summary.balance}
          />
        </Grid>
      </Grid>
      <CashTable
        emptyMessage="Nenhuma movimentação no período"
        movements={summary.movements}
      />
    </Stack>
  );
}
