import express from "express";
import swaggerUi from "swagger-ui-express";
import colors from "colors";

// Import routes
import { swaggerSpec } from "./config/swagger";

// Create an Express app
const app = express();
const port = process.env.PORT || 3000;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
	explorer: true,
	customCss: '.swagger-ui .topbar { display: none }',
	customSiteTitle: 'API Logistics',
	customfavIcon: '/favicon.ico'
}));

// Middleware to handle errors
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
	console.error(colors.red.bold(`Error: ${err.message}`));
	res.status(500).json({ error: "Something broke!", message: err.message });
})

// Initialize and start the server
const startServer = async () => {
	try {
		app.listen(port, () => {
			console.log(colors.green.bold(`Server running on port ${port}`));
			console.log(colors.blue.bold(`Swagger UI available at http://localhost:${port}/api-docs`));
		});
	} catch (error) {
		console.error(colors.red.bold(`Error starting server: ${error}`));
		process.exit(1);
	}
};

startServer();

export default app;