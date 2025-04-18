const path = require('path');

const uploadToIPFS = async (localPath) => {
  const fileName = path.basename(localPath);
  return `https://fake-ipfs.io/ipfs/${fileName}`; // Simulación de URL
};

module.exports = { uploadToIPFS };
