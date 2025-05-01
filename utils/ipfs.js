// utils/ipfs.js
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

const uploadToIPFS = async (filePath) => {
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    throw new Error('Faltan las credenciales de Pinata en .env');
  }

  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));

  try {
    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      maxContentLength: Infinity,
      headers: {
        ...formData.getHeaders(),
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY
      }
    });

    const hash = response.data.IpfsHash;
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  } catch (error) {
    console.error('[uploadToIPFS] Error al subir a IPFS:', error.response?.data || error.message);
    throw new Error('Error al subir archivo a IPFS');
  }
};

module.exports = { uploadToIPFS };
