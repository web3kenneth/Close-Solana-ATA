此程序旨在关闭solana账户中的SPL-Token-ATA账户，并回收租金，单个代币ATA账户可回收超过0.002SOL。注意：请确保没有S PL代币余额，否则程序将首先烧毁代币再进行租金回收
(This procedure is designed to close the SPL-Token-ATA account in the solana account and recover the rent. A single token ATA account can recover more than 0.002 SOL. Note: Please make sure there is no SPL token balance, otherwise the program will burn the tokens first and then perform rent recovery)

使用方法 (Instructions) 👇

1. 安装node.js (Install node.js)
2. 进入文件夹安装依赖: npm install bs58 @solana/web3.js @solana/spl-token (Enter the folder to install dependencies: npm install bs58 @solana/web3.js @solana/spl-token)
3. 进入“start.js”文件，并将solana私钥添加到代码第17行的参数内 (Enter the "start.js" file and add the solana private key to the parameters on line 17 of the code)
4. 运行程序: node start.js (Run program: node start.js)
