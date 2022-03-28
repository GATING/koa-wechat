const { name } = require('./package.json')
module.exports = {
  apps: [
    {
      name,
      script: './app.js',
      max_memory_restart: '200M',
      instance_var: 'INSTANCE_ID',
      exec_mode: 'cluster'
    }
  ]
}
