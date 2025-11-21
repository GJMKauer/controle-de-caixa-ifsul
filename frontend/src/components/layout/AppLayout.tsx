import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

export interface AppLayoutProps {
  children: React.ReactNode;
}

/** Layout padrão com AppBar e container centralizado.
 * @param children - Conteúdo interno do layout.
 * @returns Estrutura de layout com cabeçalho e conteúdo.
 */
export default function AppLayout(props: AppLayoutProps) {
  const { children } = props;

  const location = useLocation();

  /** Verifica se uma rota está ativa para ajustar o estado visual.
   * @param path - Caminho de rota.
   * @returns Verdadeiro se a rota atual corresponde ao caminho informado.
   */
  const isActive = (path: string): boolean => location.pathname === path;

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
      <AppBar position="static" sx={{ backgroundColor: "primary.main" }}>
        <Toolbar>
          <Typography
            component={Link}
            sx={{ color: "white", fontWeight: 700, textDecoration: "none" }}
            to="/dashboard"
            variant="h6"
          >
            Controle de Caixa
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ marginLeft: "auto" }}>
            <Button
              color="inherit"
              component={Link}
              sx={{
                fontWeight: isActive("/dashboard") ? 700 : 500,
                opacity: isActive("/dashboard") ? 1 : 0.85,
              }}
              to="/dashboard"
              variant={isActive("/dashboard") ? "contained" : "text"}
            >
              Dashboard
            </Button>
            <Button
              color="inherit"
              component={Link}
              sx={{
                fontWeight: isActive("/movimentacoes") ? 700 : 500,
                opacity: isActive("/movimentacoes") ? 1 : 0.85,
              }}
              to="/movimentacoes"
              variant={isActive("/movimentacoes") ? "contained" : "text"}
            >
              Movimentações
            </Button>
            <Button
              color="inherit"
              component={Link}
              sx={{
                fontWeight: isActive("/relatorios") ? 700 : 500,
                opacity: isActive("/relatorios") ? 1 : 0.85,
              }}
              to="/relatorios"
              variant={isActive("/relatorios") ? "contained" : "text"}
            >
              Relatórios
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
