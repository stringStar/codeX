import axios from 'axios';
import path from 'path';
import _ from 'lodash';
import fs from 'fs';
import {setTimeout} from "node:timers/promises";
import { generateWallets } from '../utils/hdwallet';

 async function retry(fn, params = [], retryDelay = 1000, numRetries = 3) {
    for (let i = 0; i < numRetries; i++) {
      try {
          const res = await fn(...params);
          return res || true;
      } catch (e) {
        if (i === numRetries - 1)  {
        //   console.log(e);
          return false
        }
        await setTimeout(retryDelay)
        retryDelay = retryDelay * 2
      }
    }
}
const auth = async (walletAddress) => {
    
        const result = await axios.post('https://edge.rivalrytoken.xyz/web3/wallet/auth', {
            walletAddress
        }, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
            },
            timeout: 5000
        });
        const { signature } = result.data;
        const faucet = await axios.post('https://edge.rivalrytoken.xyz/campaign/faucet/activity/faucet01', {}, { headers: { cookie: signature, "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36" } });
        const { drip, nuts } = faucet.data;
        console.log(`${walletAddress} -- 本次领取${drip.total}, 总共${nuts[0].total}`)
}

const main = async () => {
    const filePath = path.resolve(__dirname, '../wallets/rivalrytoken.json');
    let wallets = [];
    if (fs.existsSync(filePath)) {
        wallets = require('../wallets/rivalrytoken.json')?.wallets;
    }
    if (!fs.existsSync(filePath) || _.isEmpty(wallets)) {
        generateWallets('rivalrytoken', 50);
        wallets = require('../wallets/rivalrytoken.json')?.wallets;
    }

    for (let wallet of wallets) {
        await setTimeout(1000)
        const res = await retry(auth, [wallet.eth])
        if(!res) {
            console.log(`领取失败：${wallet.eth}`)
        }
    }
}

main()