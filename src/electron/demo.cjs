const { readFile } = require('fs');
const { resolve } = require('path');

readFile(resolve(__dirname, './file-1725967483740.bin'), (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(data);
});
