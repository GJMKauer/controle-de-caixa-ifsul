import { useEffect, useState } from "react";
import {
  Button,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { MovementPayload, MovementType, Account } from "../../types/cash";
import { applyDateMask, getTodayInputDate } from "../../utils/formatters";

export interface CashFormProps {
  accounts: Array<Account>;
  onSubmit: (movement: MovementPayload) => Promise<void> | void;
}

/** Formulário para criação de novas movimentações de caixa.
 * @param accounts - Contas disponíveis para seleção.
 * @param onSubmit - Callback ao enviar o formulário.
 * @returns Formulário controlado com validações simples.
 */
export default function CashForm(props: CashFormProps) {
  const { accounts, onSubmit } = props;

  const [account, setAccount] = useState(accounts[0]?.id ?? "");
  const [amount, setAmount] = useState("0");
  const [date, setDate] = useState(getTodayInputDate());
  const [description, setDescription] = useState("");
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [useTransfer, setUseTransfer] = useState(false);
  const [type, setType] = useState<MovementType>("INCOME");

  /** Reset os campos após envio bem-sucedido. */
  const resetForm = (): void => {
    setAmount("0");
    setDate(getTodayInputDate());
    setDescription("");
    setFromAccount("");
    setToAccount("");
    setUseTransfer(false);
    setType("INCOME");
  };

  /** Define o tipo da movimentação a partir da seleção.
   * @param value - Identificador do tipo.
   */
  const handleTypeChange = (value: MovementType): void => setType(value);

  /** Executa o envio do formulário para o componente pai. */
  const handleSubmit = async (): Promise<void> => {
    const numericAmount = Number(amount);

    if (!description || Number.isNaN(numericAmount) || numericAmount <= 0 || !date) {
      return;
    }

    const hasTransfer = useTransfer && fromAccount && toAccount && fromAccount !== toAccount;
    if (!hasTransfer && !account) {
      return;
    }

    const payloadAccount = hasTransfer ? toAccount : account;
    await onSubmit({
      account: payloadAccount,
      amount: numericAmount,
      date,
      description,
      fromAccount: hasTransfer ? fromAccount : undefined,
      toAccount: hasTransfer ? toAccount : undefined,
      type,
    });

    resetForm();
  };

  useEffect(() => {
    if (accounts.length === 0) {
      return;
    }

    if (!account) {
      setAccount(accounts[0].id);
    }
    if (!fromAccount) {
      setFromAccount(accounts[0].id);
    }
    if (!toAccount && accounts.length > 1) {
      setToAccount(accounts[1].id);
    } else if (!toAccount) {
      setToAccount(accounts[0].id);
    }
  }, [account, accounts, fromAccount, toAccount]);

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
        onChange={(event) => setDate(applyDateMask(event.target.value))}
        placeholder="DD/MM/AAAA"
        type="text"
        value={date}
      />
      <FormControlLabel
        control={<Switch checked={useTransfer} onChange={(_event, checked) => setUseTransfer(checked)} />}
        label="Transferência entre contas"
      />
      {useTransfer ? (
        <>
          <TextField
            label="Conta de origem"
            onChange={(event) => setFromAccount(event.target.value)}
            select
            value={fromAccount}
          >
            {accounts.map((currentAccount) => (
              <MenuItem key={currentAccount.id} value={currentAccount.id}>
                {currentAccount.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Conta de destino"
            onChange={(event) => setToAccount(event.target.value)}
            select
            value={toAccount}
          >
            {accounts.map((currentAccount) => (
              <MenuItem key={currentAccount.id} value={currentAccount.id}>
                {currentAccount.name}
              </MenuItem>
            ))}
          </TextField>
        </>
      ) : (
        <TextField label="Conta" onChange={(event) => setAccount(event.target.value)} select value={account}>
          {accounts.map((currentAccount) => (
            <MenuItem key={currentAccount.id} value={currentAccount.id}>
              {currentAccount.name}
            </MenuItem>
          ))}
        </TextField>
      )}
      <Button onClick={handleSubmit} size="large" variant="contained">
        Registrar
      </Button>
    </Stack>
  );
}
