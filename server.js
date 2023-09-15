process.on('uncaughtException', (err) => {
  console.log('Uncaught rejection!');
  console.log(err.name, err.message, err.stack);
  console.log(
    '---------------------------------\n\t Server fechando... \n---------------------------------'
  );
  process.exit(1);
});

require('dotenv').config();

const server = require('./app');
const mongoose = require('mongoose');

const db_url = (
  process.env.NODE_ENV === 'development'
    ? process.env.DB_URL_LOCAL
    : process.env.DB_URL.replace('<username>', process.env.DB_USERNAME).replace(
        '<password>',
        process.env.DB_PASSWORD
      )
).replace('<database>', process.env.DB_NAME);

mongoose.connect(db_url).then(() => {
  console.log('DB connected!!!');
});

const serverApp = server.listen(process.env.PORT || 8080, () => {
  console.log(
    '---------------------------------\n\t Server iniciado... \n---------------------------------'
  );
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled rejection!');
  console.log(err);
  console.log(
    '---------------------------------\n\t Server fechando... \n---------------------------------'
  );
  serverApp.close(() => {
    process.exit(1);
  });
});
