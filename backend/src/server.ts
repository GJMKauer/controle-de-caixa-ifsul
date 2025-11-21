import cors from "cors";
import express from "express";
import cashRoutes from "./routes/cashRoutes";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

/** Cria a aplicação Express com middlewares e rotas.
 * @returns Instância configurada do Express.
 */
const createApp = (): express.Application => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api", cashRoutes);

  return app;
};

/** Inicializa o servidor HTTP.
 * @returns Promessa resolvida quando o servidor estiver ouvindo.
 */
const startServer = async (): Promise<void> => {
  const app = createApp();

  app.listen(PORT, () => console.log(`Servidor iniciado na porta ${PORT}`));
};

void startServer();

export { createApp, startServer };
