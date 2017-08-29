

/**
 * encrypt - description
 *
 * @param  {type} key       description
 * @param  {type} plaintext description
 * @return {type}           description
 */
function encrypt(key, plaintext) {
  return new Promise((resolve,reject) => {
    var k = new triplesec.Buffer(key);
    var p = new triplesec.Buffer(plaintext);
    triplesec.encrypt({key: k, data: p}, (err,buff) => {
      if (err) return reject(err);
      resolve(buff.toString('hex'));
    });
  });
}

/**
 * decrypt - description
 *
 * @param  {type} key        description
 * @param  {type} ciphertext description
 * @return {type}            description
 */
function decrypt(key, ciphertext) {
  return new Promise((resolve,reject) => {
    var k = new triplesec.Buffer(key);
    var c = new triplesec.Buffer(ciphertext, 'hex');
    triplesec.decrypt({key: k, data: c}, (err,buff) => {
      if (err) return reject(err);
      resolve(buff.toString());
    });
  });
}
