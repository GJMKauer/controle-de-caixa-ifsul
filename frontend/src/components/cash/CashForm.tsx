import { useEffect, useMemo, useState } from "react";
import { Button, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { MovementPayload, MovementType, Account, Product } from "../../types/cash";
import { getTodayInputDate, normalizeDate } from "../../utils/formatters";

export interface CashFormProps {
  accounts: Array<Account>;
  onSubmit: (movement: MovementPayload) => Promise<void> | void;
  products: Array<Product>;
}

/**  Formulário para criação de novas movimentações de caixa.
 * @param accounts - Contas disponíveis para seleção.
 * @param onSubmit - Callback ao enviar o formulário.
 * @param products - Produtos disponíveis para seleção.
 * @returns Formulário controlado com validações simples.
 */
export default function CashForm(props: CashFormProps) {
  const { accounts, onSubmit, products } = props;

  const [account, setAccount] = useState(accounts[0]?.id ?? "");
  const [amount, setAmount] = useState("0");
  const [date, setDate] = useState(getTodayInputDate());
  const [description, setDescription] = useState("");
  const [productId, setProductId] = useState("");
  const [type, setType] = useState<MovementType>("INCOME");

  /** Reset os campos após envio bem-sucedido. */
  const resetForm = (): void => {
    setAmount("0");
    setDate(getTodayInputDate());
    setDescription("");
    setProductId("");
    setType("INCOME");
  };

  /** Define o tipo da movimentação a partir da seleção.
   * @param value - Identificador do tipo.
   */
  const handleTypeChange = (value: MovementType): void => setType(value);

  /** Executa o envio do formulário para o componente pai. */
  const handleSubmit = async (): Promise<void> => {
    const numericAmount = Number(amount);

    if (!description || Number.isNaN(numericAmount) || numericAmount <= 0 || !date || !account) {
      return;
    }

    await onSubmit({
      account,
      amount: numericAmount,
      date,
      description,
      productId: productId || undefined,
      type,
    });

    resetForm();
  };

  /** Lista de produtos filtrados pela conta selecionada. */
  const filteredProducts = useMemo(
    () => products.filter((product) => product.account === account),
    [account, products]
  );

  useEffect(() => {
    if (!account && accounts.length > 0) {
      setAccount(accounts[0].id);
    }
  }, [account, accounts]);

  return (
    <Stack spacing={2}>
      <Typography fontWeight={600} variant="h6">
        Nova movimentação
      </Typography>
      <ToggleButtonGroup exclusive onChange={(_event, value) => value && handleTypeChange(value)} value={type}>
        <ToggleButton value="INCOME">Entrada</ToggleButton>
        <ToggleButton value="OUTCOME">Saída</ToggleButton>
      </ToggleButtonGroup>
      <TextField
        label="Descrição"
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Ex.: Venda, pagamento"
        value={description}
      />
      <TextField
        InputProps={{ inputProps: { min: 0, step: 0.01 } }}
        label="Valor (R$)"
        onChange={(event) => setAmount(event.target.value)}
        type="number"
        value={amount}
      />
      <TextField
        InputLabelProps={{ shrink: true }}
        inputProps={{ inputMode: "numeric", pattern: "\\d{2}/\\d{2}/\\d{4}" }}
        label="Data"
        onChange={(event) => setDate(normalizeDate(event.target.value))}
        placeholder="DD/MM/AAAA"
        type="text"
        value={date}
      />
      <TextField label="Conta" onChange={(event) => setAccount(event.target.value)} select value={account}>
        {accounts.map((currentAccount) => (
          <MenuItem key={currentAccount.id} value={currentAccount.id}>
            {currentAccount.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField label="Produto" onChange={(event) => setProductId(event.target.value)} select value={productId}>
        <MenuItem value="">Nenhum</MenuItem>
        {filteredProducts.map((product) => (
          <MenuItem key={product.id} value={product.id}>
            {product.name}
          </MenuItem>
        ))}
      </TextField>
      <Button onClick={handleSubmit} size="large" variant="contained">
        Registrar
      </Button>
    </Stack>
  );
}
