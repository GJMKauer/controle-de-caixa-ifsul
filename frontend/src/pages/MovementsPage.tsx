import { useEffect, useState } from "react";
import { Grid, Paper, Stack, Typography } from "@mui/material";
import {
  createMovement,
  getAccounts,
  getProducts,
  listMovements,
  MovementFilters,
} from "../api/cashApi";
import CashFilters from "../components/cash/CashFilters";
import CashForm from "../components/cash/CashForm";
import CashTable from "../components/cash/CashTable";
import { Account, Movement, MovementPayload, Product } from "../types/cash";

/** Página de listagem e criação de movimentações.
 * @returns Estrutura com filtros, tabela e formulário de criação.
 */
export default function MovementsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filters, setFilters] = useState<MovementFilters>({});
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  /** Busca movimentações conforme filtros ativos.
   * @param currentFilters - Filtros opcionais.
   */
  const loadMovements = async (
    currentFilters?: MovementFilters
  ): Promise<void> => {
    const data = await listMovements(currentFilters);
    setMovements(data);
  };

  /** Carrega contas e produtos necessários para o formulário. */
  const loadSupportingData = async (): Promise<void> => {
    const [accountsData, productsData] = await Promise.all([
      getAccounts(),
      getProducts(),
    ]);
    setAccounts(accountsData);
    setProducts(productsData);
  };

  /** Trata o envio de um novo registro e recarrega dados.
   * @param payload - Dados da movimentação.
   */
  const handleCreate = async (payload: MovementPayload): Promise<void> => {
    await createMovement(payload);
    await Promise.all([loadMovements(filters), loadSupportingData()]);
  };

  /** Aplica filtros informados pelo usuário.
   * @param newFilters - Filtros recebidos do componente filho.
   */
  const handleApplyFilters = async (
    newFilters: MovementFilters
  ): Promise<void> => {
    setFilters(newFilters);
    await loadMovements(newFilters);
  };

  useEffect(() => {
    void loadSupportingData();
    void loadMovements(filters);
  }, []);

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ md: "row", xs: "column" }}
        justifyContent="space-between"
        spacing={2}
      >
        <Stack spacing={0.5}>
          <Typography variant="h5">Movimentações</Typography>
          <Typography color="text.secondary" variant="body2">
            Registre entradas, saídas e acompanhe o caixa diário.
          </Typography>
        </Stack>
        <CashFilters
          defaultFrom={filters.from}
          defaultTo={filters.to}
          onApply={handleApplyFilters}
        />
      </Stack>
      <Grid container spacing={3}>
        <Grid item md={7} xs={12}>
          <CashTable movements={movements} />
        </Grid>
        <Grid item md={5} xs={12}>
          <Paper sx={{ padding: 3 }}>
            <CashForm
              accounts={accounts}
              onSubmit={handleCreate}
              products={products}
            />
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
