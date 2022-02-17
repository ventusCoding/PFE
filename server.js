const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXEPTION! Shutting Down...');
  process.exit(1);
});

console.log(process.env.NODE_ENV);

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log('DB connection successful');
  });


  const port = process.env.PORT || 3000;
  const server = app.listen(port, () => {
    console.log(`App running on port ${port}`);
  });
  
  process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    console.log('UNHANDLER REJECTION! Shutting Down...');
    server.close(() => {
      process.exit(1);
    });
  });
  
