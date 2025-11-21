import { useState } from "react";
import { Button, Stack, TextField } from "@mui/material";
import { MovementFilters } from "../../api/cashApi";

export interface CashFiltersProps {
  defaultFrom?: string;
  defaultTo?: string;
  onApply: (filters: MovementFilters) => void;
}

/** Filtros por período para consultas de movimentações.
 * @param defaultFrom - Data inicial padrão.
 * @param defaultTo - Data final padrão.
 * @param onApply - Callback ao aplicar filtros.
 * @returns Formulário de filtros.
 */
export default function CashFilters(props: CashFiltersProps) {
  const { defaultFrom = "", defaultTo = "", onApply } = props;

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  /** Normaliza datas com hífen para o formato dd/MM/yyyy.
   * @param value - Valor digitado.
   * @returns Data normalizada.
   */
  const normalizeDate = (value: string): string => {
    const trimmed = value.trim();
    const dashMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (dashMatch) {
      const [, year, month, day] = dashMatch;

      return `${day}/${month}/${year}`;
    }

    return trimmed;
  };

  /** Notifica o consumidor com os valores vigentes. */
  const handleSubmit = (): void => {
    onApply({
      from: from || undefined,
      to: to || undefined,
    });
  };

  /** Atualiza a data inicial selecionada.
   * @param value - Data informada.
   */
  const handleFromChange = (value: string): void =>
    setFrom(normalizeDate(value));

  /** Atualiza a data final selecionada.
   * @param value - Data informada.
   */
  const handleToChange = (value: string): void => setTo(normalizeDate(value));

  return (
    <Stack
      direction={{ md: "row", xs: "column" }}
      spacing={2}
      sx={{ alignItems: "flex-end" }}
    >
      <TextField
        InputLabelProps={{ shrink: true }}
        inputProps={{ inputMode: "numeric", pattern: "\\d{2}/\\d{2}/\\d{4}" }}
        label="De"
        onChange={(event) => handleFromChange(event.target.value)}
        placeholder="DD/MM/AAAA"
        type="text"
        value={from}
      />
      <TextField
        InputLabelProps={{ shrink: true }}
        inputProps={{ inputMode: "numeric", pattern: "\\d{2}/\\d{2}/\\d{4}" }}
        label="Até"
        onChange={(event) => handleToChange(event.target.value)}
        placeholder="DD/MM/AAAA"
        type="text"
        value={to}
      />
      <Button onClick={handleSubmit} variant="contained">
        Filtrar
      </Button>
    </Stack>
  );
}
