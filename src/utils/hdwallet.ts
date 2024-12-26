import { ethers } from "ethers";
import fs from 'fs';
import path from 'path';

export function hdWallet(limit: number, mnemonic: string = '') {
    if (!mnemonic) {
        const { mnemonic: randomMnemonic } = ethers.Wallet.createRandom();
        mnemonic = randomMnemonic.phrase;
    }
    const wallets = []
    for (let i = 0; i < limit; i++) {
        const path = `m/44'/60'/0'/0/${i}`;
        let hdnode = ethers.utils.HDNode.fromMnemonic(mnemonic);
        let node = hdnode.derivePath(path);
        let wallet = new ethers.Wallet(node.privateKey);
        wallets.push({
            ethPrivate: wallet.privateKey,
            eth: wallet.address,
            path,
            limit: i
        })
    }

    return {
        mnemonic,
        wallets
    }
}

export const generateWallets = (filename: string, limit: number, inputMnemonic: string = '') => {
    let mnemonic = inputMnemonic;
    const filePath = path.resolve(__dirname, `../wallets/${filename}.json`);
    if (!mnemonic && fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        try {
            const jsonData = JSON.parse(fileContent);
            if (jsonData.mnemonic) {
                mnemonic = jsonData.mnemonic; // 使用文件中的 mnemonic
                console.log(`文件已存在，使用文件中的mnemonic`);
            }
        } catch (error) {
            console.error('文件内容解析失败，重新生成文件:', error);
        }
    }
    const result = hdWallet(limit, mnemonic);
    const dir = path.dirname(filePath);
    
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(result, null, 2), "utf8")
    console.log(`钱包生成完成`);
}

