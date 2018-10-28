process.stdin.resume();
(async function() {
  try {
    let fs = require('fs')
    
    let opts = {
      mdbhost: "127.0.0.1",
      mdbport: "27017",
      mdbuser: "admin",
      mdbpass: "admin",
      mdbauthmetd: "DEFAULT",
      recaptchasite: "SITEKEY",
      recaptchasecret: "SECRETKEY"
    }
    
    await fs.writeFileSync('config.json', JSON.stringify(opts))
    
    require('./index.js')

    setTimeout(function() {
      process.exit(0);
    }, 10000)
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})()
