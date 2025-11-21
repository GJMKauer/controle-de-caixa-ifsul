import { Card, CardContent, Stack, Typography } from "@mui/material";
import { formatCurrency } from "../../utils/formatters";

export interface CashSummaryCardProps {
  color?: string;
  subtitle: string;
  value: number;
}

/** Card para exibir totais do caixa.
 * @param props - Propriedades do componente.
 * @returns Card estilizado com valor e descrição.
 */
export default function CashSummaryCard(props: CashSummaryCardProps) {
  const { color = "primary.main", subtitle, value } = props;

  return (
    <Card elevation={2} sx={{ borderTop: `4px solid`, borderTopColor: color }}>
      <CardContent>
        <Stack spacing={1}>
          <Typography color="text.secondary" variant="body2">
            {subtitle}
          </Typography>
          <Typography color={color} fontWeight={700} variant="h5">
            {formatCurrency(value)}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
