try {
  require('./index.js')
  setTimeout(function() {
    process.exit(0);
  }, 10000)
} catch (err) {
  console.error(err);
  process.exit(1);
}
