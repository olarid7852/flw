export default {
  uri: process.env.MONGO_DB_SERVER_URI || 'mongodb://127.0.0.1/my_database',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
};
