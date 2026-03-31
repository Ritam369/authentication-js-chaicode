import "dotenv/config"
import connectDB from "./src/common/config/db.js";
import app from "./src/app.js";

const start = async () => {
  try {
    await connectDB();
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port} on ${process.env.NODE_ENV} environment`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

start();