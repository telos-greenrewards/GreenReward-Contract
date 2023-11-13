import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

require('dotenv').config();

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
      accounts: [process.env.TELOS_TESTNET_PRIVATE_KEY],
      chainId: 41,
    },
  },
};

export default config;