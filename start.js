const {
    Connection,
    PublicKey,
    Keypair,
    Transaction,
    sendAndConfirmTransaction,
  } = require('@solana/web3.js');
  const {
    createCloseAccountInstruction,
    createBurnInstruction,
    TOKEN_PROGRAM_ID,
    getAccount,
  } = require('@solana/spl-token');
  const bs58 = require('bs58');
  
  // Base58格式的私钥
  const base58SecretKey = 'PRIVATE_KYE'; // 你的私钥(Your Private key)
  
  // 解码Base58私钥
  const secretKey = bs58.decode(base58SecretKey);
  const payer = Keypair.fromSecretKey(secretKey);
  
  // 创建连接
  const connection = new Connection('https://public.ligmanode.com', 'confirmed');
  
  async function closeAllTokenAccounts() {
    const owner = payer.publicKey;
  
    // 查找所有Token账户
    const tokenAccounts = await connection.getTokenAccountsByOwner(owner, {
      programId: TOKEN_PROGRAM_ID,
    });
  
    console.log(`Found ${tokenAccounts.value.length} token accounts`);
  
    // 创建一个新的交易来批量处理关闭账户
    let transaction = new Transaction();
    let transactionCount = 0;
    const maxInstructionsPerTransaction = 1; // 每个交易的最大指令数量
  
    for (const accountInfo of tokenAccounts.value) {
      const tokenAccountAddress = new PublicKey(accountInfo.pubkey);
  
      console.log(`Preparing to close token account: ${tokenAccountAddress.toBase58()}`);
  
      // 获取Token账户信息
      const tokenAccount = await getAccount(connection, tokenAccountAddress);
  
      // 如果账户中有代币，先销毁代币
      if (tokenAccount.amount > 0) {
        console.log(`Burning ${tokenAccount.amount} tokens from account ${tokenAccountAddress.toBase58()}`);
        const burnInstruction = createBurnInstruction(
          tokenAccountAddress,
          tokenAccount.mint,
          owner,
          tokenAccount.amount,
          []
        );
        transaction.add(burnInstruction);
        transactionCount++;
      }
  
      // 创建关闭账户指令
      const closeInstruction = createCloseAccountInstruction(
        tokenAccountAddress,
        owner, // 租金返还到这个地址
        owner,
        payer.publicKey
      );
  
      transaction.add(closeInstruction);
      transactionCount++;
  
      // 如果交易中的指令数量达到了最大值，则发送交易并创建新的交易
      if (transactionCount >= maxInstructionsPerTransaction) {
        try {
          const signature = await sendAndConfirmTransaction(connection, transaction, [payer]);
          console.log(`Batch close transaction signature: ${signature}`);
        } catch (error) {
          console.error(`Failed to close accounts: ${error.message}`);
          if (error.logs) {
            error.logs.forEach(log => console.error(log));
          }
        }
  
        // 添加延迟以避免429错误
        await new Promise(resolve => setTimeout(resolve, 2000));
  
        // 创建一个新的交易来处理剩余的账户
        transaction = new Transaction();
        transactionCount = 0;
      }
    }
  
    // 如果还有未发送的指令，发送最后一个交易
    if (transactionCount > 0) {
      try {
        const signature = await sendAndConfirmTransaction(connection, transaction, [payer]);
        console.log(`Final batch close transaction signature: ${signature}`);
      } catch (error) {
        console.error(`Failed to close accounts: ${error.message}`);
        if (error.logs) {
          error.logs.forEach(log => console.error(log));
        }
      }
    }
  }
  
  closeAllTokenAccounts().catch(err => {
    console.error(err);
  });