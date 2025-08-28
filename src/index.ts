import app from "./app.js";

const port: string | number = process.env.PORT || 3600;
app.listen(port, () => {
  console.log(`Listening: http://localhost:${port}`);
});
