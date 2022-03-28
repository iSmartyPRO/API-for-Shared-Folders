const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const timezoned = () => {
  return new Date().toLocaleString('ru-RU', {
      timeZone: 'Europe/Moscow'
  });
}

const logger = createLogger({
  format: combine(
    label({ label: 'App' }),
    timestamp({ format: timezoned }),
    myFormat
  ),
  transports: [
    new transports.File({ filename: './logs/app.log'}),
  ],
})

module.exports = logger