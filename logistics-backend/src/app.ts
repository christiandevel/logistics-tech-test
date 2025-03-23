import express from "express";
import colors from "colors";

// Create an Express app
const app = express();
const port = process.env.PORT || 3000;


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