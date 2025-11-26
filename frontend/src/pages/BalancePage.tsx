import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { createAsset, getAccounts, getBalanceSheet, listMovements, MovementFilters } from "../api/cashApi";
import LedgerTable from "../components/balance/LedgerTable";
import CashSummaryCard from "../components/cash/CashSummaryCard";
import { useLedgers } from "../hooks/useLedgers";
import { applyDateMask, formatDate, getTodayInputDate } from "../utils/formatters";
import { Account, AssetInput, BalanceLine, BalanceSheet, Movement } from "../types/cash";

/** Página de balanço patrimonial com depreciação. */
export default function BalancePage(): JSX.Element {
  const [accounts, setAccounts] = useState<Array<Account>>([]);
  const [assetForm, setAssetForm] = useState<AssetInput>({
    accountId: "",
    acquisitionDate: getTodayInputDate(),
    cost: 0,
    name: "",
  });
  const [balance, setBalance] = useState<BalanceSheet | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [movements, setMovements] = useState<Array<Movement>>([]);

  /** Obtém o mês anterior no formato YYYY-MM. */
  const getPreviousMonth = (): string => {
    const now = new Date();
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const month = now.getMonth() === 0 ? 12 : now.getMonth();

    return `${year}-${String(month).padStart(2, "0")}`;
  };

  const [monthFilter, setMonthFilter] = useState<string>(getPreviousMonth());
  const maxMonth = getPreviousMonth();

  /** Converte filtro mensal (YYYY-MM) para datas do mês. */
  const transformMonthToFilters = (month: string): MovementFilters | undefined => {
    if (!month) {
      return undefined;
    }

    const [year, monthPart] = month.split("-");
    if (!year || !monthPart) {
      return undefined;
    }

    const start = `01/${monthPart}/${year}`;
    const endDate = new Date(Number(year), Number(monthPart), 0);
    const end = `${String(endDate.getDate()).padStart(2, "0")}/${monthPart}/${year}`;

    return { from: start, to: end };
  };

  const assetAccounts = useMemo(() => accounts.filter((account) => account.category === "ASSET"), [accounts]);

  /** Mapeia contas por ID para acesso rápido. */
  const accountById = useMemo(
    () =>
      accounts.reduce<Record<string, Account>>((accumulator, account) => {
        accumulator[account.id] = account;
        return accumulator;
      }, {}),
    [accounts]
  );

  const ledgers = useLedgers({ accountById, accounts, movements });
  const adjustLinesWithLedger = (lines: Array<BalanceLine>): Array<BalanceLine> =>
    lines.map((line) => {
      const ledger = ledgers[line.accountId] ?? { credits: [], debits: [] };
      const sfEntry = [...ledger.debits, ...ledger.credits].find((entry) => entry.id === "SF");
      const closing = sfEntry?.amount ?? line.netValue;
      const netAfterDep = Math.max(0, closing - line.depreciation);

      return {
        ...line,
        netValue: netAfterDep,
        totalCost: closing,
      };
    });
  const adjustedAssets = adjustLinesWithLedger(balance?.assets ?? []);
  const adjustedLiabilities = adjustLinesWithLedger(balance?.liabilities ?? []);
  const assetsTotal = adjustedAssets.reduce((accumulator, line) => accumulator + line.netValue, 0);
  const liabilitiesTotal = adjustedLiabilities.reduce((accumulator, line) => accumulator + line.netValue, 0);

  /** Carrega balanço, contas e movimentações. */
  const loadData = async (): Promise<void> => {
    const [sheet, accountList, movementList] = await Promise.all([
      getBalanceSheet(monthFilter),
      getAccounts(),
      listMovements(transformMonthToFilters(monthFilter)),
    ]);
    setBalance(sheet);
    setAccounts(accountList);
    setMovements(movementList);
    if (!assetForm.accountId && accountList.length > 0) {
      setAssetForm((current) => ({ ...current, accountId: accountList[0].id }));
    }
  };

  /** Trata campos do formulário de ativo. */
  const handleAssetChange = (field: keyof AssetInput, value: string): void => {
    setAssetForm((current) => ({
      ...current,
      [field]: field === "cost" ? Number(value) : value,
    }));
  };

  /** Submete novo ativo patrimonial. */
  const handleSubmitAsset = async (): Promise<void> => {
    if (!assetForm.accountId || !assetForm.name || !assetForm.acquisitionDate || assetForm.cost <= 0) {
      return;
    }

    await createAsset(assetForm);
    await loadData();
    setAssetForm((current) => ({ ...current, cost: 0, name: "" }));
  };

  useEffect(() => {
    void loadData();
  }, [monthFilter]);

  const renderTable = (title: string, lines: Array<BalanceLine>, hideDepColumns = false): JSX.Element => (
    <Paper sx={{ padding: 2 }}>
      <Stack spacing={1}>
        <Typography fontWeight={600}>{title}</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Conta</TableCell>
              <TableCell align="right">Saldo final</TableCell>
              {!hideDepColumns ? <TableCell align="right">Depreciação</TableCell> : null}
              {!hideDepColumns ? <TableCell align="right">Taxa (a.a.)</TableCell> : null}
              <TableCell align="right">Valor líquido</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lines.map((line) => {
              const account = accountById[line.accountId];
              const ledger = ledgers[line.accountId] ?? { credits: [], debits: [] };
              const accentColor = account?.category === "LIABILITY" ? "rgba(231, 76, 60, 1)" : "rgba(47, 128, 237, 1)";

              return (
                <LedgerTable
                  accentColor={accentColor}
                  expanded={expanded[line.accountId]}
                  hideDepColumns={hideDepColumns}
                  key={line.accountId}
                  ledger={ledger}
                  line={line}
                  onToggle={() =>
                    setExpanded((current) => ({
                      ...current,
                      [line.accountId]: !current[line.accountId],
                    }))
                  }
                />
              );
            })}
          </TableBody>
        </Table>
      </Stack>
    </Paper>
  );

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5">Balanço Patrimonial</Typography>
        <Typography color="text.secondary" variant="body2">
          Visualize o balanço mensal com depreciação fiscal.
        </Typography>
      </Stack>
      <Box display="grid" gap={2} gridTemplateColumns={{ md: "1fr 1fr", xs: "1fr" }}>
        <TextField
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: maxMonth }}
          label="Mês de referência"
          onChange={(event) => {
            const next = event.target.value;
            if (next && next > maxMonth) {
              return;
            }
            setMonthFilter(next);
          }}
          type="month"
          value={monthFilter}
        />
        <Box />
      </Box>
      {balance ? (
        <Grid container spacing={2}>
          <Grid item md={4} xs={12}>
            <CashSummaryCard color="rgba(47, 128, 237, 1)" subtitle="Ativo Total" value={assetsTotal} />
          </Grid>
          <Grid item md={4} xs={12}>
            <CashSummaryCard color="rgba(231, 76, 60, 1)" subtitle="Passivo Total" value={liabilitiesTotal} />
          </Grid>
          <Grid item md={4} xs={12}>
            <CashSummaryCard
              color="rgba(52, 152, 219, 1)"
              subtitle="Patrimônio Líquido (calc.)"
              value={assetsTotal - liabilitiesTotal}
            />
          </Grid>
        </Grid>
      ) : null}
      <Grid container spacing={2}>
        <Grid item md={8} xs={12}>
          <Stack spacing={2}>
            {balance ? renderTable("Ativos", adjustedAssets) : null}
            {balance ? renderTable("Passivos", adjustedLiabilities, true) : null}
          </Stack>
        </Grid>
        <Grid item md={4} xs={12}>
          <Paper sx={{ padding: 3 }}>
            <Stack spacing={2}>
              <Typography fontWeight={600} variant="h6">
                Registrar bem/ativo
              </Typography>
              <TextField
                label="Nome"
                onChange={(event) => handleAssetChange("name", event.target.value)}
                placeholder="Ex.: Veículo, móvel, equipamento"
                value={assetForm.name}
              />
              <TextField
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                label="Custo (R$)"
                onChange={(event) => handleAssetChange("cost", event.target.value)}
                type="number"
                value={assetForm.cost}
              />
              <TextField
                InputLabelProps={{ shrink: true }}
                inputProps={{ inputMode: "numeric", pattern: "\\d{2}/\\d{2}/\\d{4}" }}
                label="Data de aquisição"
                onChange={(event) => handleAssetChange("acquisitionDate", applyDateMask(event.target.value))}
                placeholder="DD/MM/AAAA"
                type="text"
                value={assetForm.acquisitionDate}
              />
              <TextField
                label="Conta de destino"
                onChange={(event) => handleAssetChange("accountId", event.target.value)}
                select
                value={assetForm.accountId}
              >
                {assetAccounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name} {account.depreciationRateAnnual ? `(${account.depreciationRateAnnual}% a.a.)` : ""}
                  </MenuItem>
                ))}
              </TextField>
              <Button onClick={handleSubmitAsset} variant="contained">
                Salvar ativo
              </Button>
              {balance ? (
                <Typography color="text.secondary" variant="caption">
                  Última atualização: {formatDate(balance.date)}
                </Typography>
              ) : null}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
