import { useEffect, useMemo, useState } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { createMovement, getAccounts, getProducts, listMovements, MovementFilters } from "../api/cashApi";
import CashFilters from "../components/cash/CashFilters";
import CashForm from "../components/cash/CashForm";
import CashTable from "../components/cash/CashTable";
import { Account, Movement, MovementPayload, Product } from "../types/cash";

/** Página de listagem e criação de movimentações.
 * @returns Estrutura com filtros, tabela e formulário de criação.
 */
export default function MovementsPage() {
  const [accounts, setAccounts] = useState<Array<Account>>([]);
  const [filters, setFilters] = useState<MovementFilters>({});
  const [movements, setMovements] = useState<Array<Movement>>([]);
  const [products, setProducts] = useState<Array<Product>>([]);

  /** Mapeia IDs de conta para seus respectivos nomes. */
  const accountNames = useMemo(
    () =>
      accounts.reduce<Record<string, string>>((acc, account) => {
        acc[account.id] = account.name;
        return acc;
      }, {}),
    [accounts]
  );

  /** Busca movimentações conforme filtros ativos.
   * @param currentFilters - Filtros opcionais.
   */
  const loadMovements = async (currentFilters?: MovementFilters): Promise<void> => {
    const data = await listMovements(currentFilters);
    setMovements(data);
  };

  /** Carrega contas e produtos necessários para o formulário. */
  const loadSupportingData = async (): Promise<void> => {
    const [accountsData, productsData] = await Promise.all([getAccounts(), getProducts()]);
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
  const handleApplyFilters = async (newFilters: MovementFilters): Promise<void> => {
    setFilters(newFilters);
    await loadMovements(newFilters);
  };

  useEffect(() => {
    // "void" deixa explícito que não utilizamos o retorno da Promise e evita warnings de eslint.
    void loadSupportingData();
    void loadMovements(filters);
  }, []);

  return (
    <Stack spacing={3}>
      <Stack direction={{ md: "row", xs: "column" }} justifyContent="space-between" spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="h5">Movimentações</Typography>
          <Typography color="text.secondary" variant="body2">
            Registre entradas, saídas e acompanhe o caixa diário.
          </Typography>
        </Stack>
        <CashFilters defaultFrom={filters.from} defaultTo={filters.to} onApply={handleApplyFilters} />
      </Stack>
      <Box display="grid" gap={3} gridTemplateColumns={{ md: "2fr 1fr", xs: "1fr" }}>
        <CashTable accountNames={accountNames} movements={movements} />
        <Paper sx={{ padding: 3 }}>
          <CashForm accounts={accounts} onSubmit={handleCreate} products={products} />
        </Paper>
      </Box>
    </Stack>
  );
}
