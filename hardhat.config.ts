import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

require('dotenv').config();
const privatekey1 = process.env.TELOS_TESTNET_PRIVATE_KEY as string;
const privatekey2 = process.env.TELOS_TESTNET_PRIVATE_KEY2 as string;
const privatekey3 = process.env.TELOS_TESTNET_PRIVATE_KEY3 as string;


const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    telos_testnet: {
      url: "https://testnet.telos.net/evm",
      accounts: [privatekey1, privatekey2, privatekey3],
      chainId: 41,
    },
  },
};

export default config;