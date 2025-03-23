import express from "express";
import colors from "colors";

// Create an Express app
const app = express();
const port = process.env.PORT || 3000;

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
		});
	} catch (error) {
		console.error(colors.red.bold(`Error starting server: ${error}`));
	}
};

startServer();

export default app;