module.exports = {
  /**Declaration of databases for my development environment**/
  development: {
    databases: {
      realworld: {
        database: 'test', //you should always save these values in environment variables
        username: 'root', //only for testing purposes you can also define the values here
        password: '1234',
        host: 'localhost',
        port: '3306',
        dialect: 'mysql'
      }
    }
  }
};
