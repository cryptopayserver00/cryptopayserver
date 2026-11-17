import { getAccount, TOKEN_PROGRAM_ID, AccountLayout } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';

const connection = new Connection(
  'https://quiet-evocative-sanctuary.solana-devnet.quiknode.pro/9546a31f74b22b085dc30ae790d10b23014825af',
  'confirmed',
);

// const mintAddress = new PublicKey('mint');
const ownerAddress = new PublicKey('3LAsjVjQeXqnxmHJgLAhseVVV3TP45WZ33tamXxPVMPV');

// const signatures = await connection.getSignaturesForAddress(ownerAddress, {
//   limit: 10,
// });

// let signaturesArray = [];

// signatures.forEach((item) => {
//   signaturesArray.push(item.signature);
// });

// const txs = await connection.getParsedTransactions(signaturesArray, {
//   commitment: 'confirmed',
//   maxSupportedTransactionVersion: 0,
// });

// txs.forEach(async (tx) => {
//     console.log("tx", tx.transaction.signatures.length)
//     console.log("tx", tx)

//   tx.transaction.message.instructions.forEach(async (instruction) => {
//     //   console.log('instruction.programId', instruction);

//     // 检查是否是系统转账指令
//     if (instruction.programId.equals(PublicKey.default)) {
//       const parsed = instruction.parsed;

//       if (parsed.type && parsed.type === 'transfer') {
//         const from = parsed.info.source; // 发起者地址
//         const to = parsed.info.destination; // 接收者地址
//         const amount = parsed.info.lamports; // 数据中是转账金额的字符串形式，需解析

//         console.log('From:', new PublicKey(from).toBase58());
//         console.log('To:', new PublicKey(to).toBase58());
//         console.log('Amount (in lamports):', amount);

//         // 如果需要以 SOL 表示，转换为 SOL（1 SOL = 1,000,000,000 lamports）
//         const amountInSol = amount / 1_000_000_000;
//         console.log('Amount (in SOL):', amountInSol);
//       }
//     }

//     if (instruction.programId.equals(TOKEN_PROGRAM_ID)) {
//       const parsed = instruction.parsed;

//     //   console.log('parsed', parsed.info.tokenAmount);

//       if (parsed.type && parsed.type === 'transferChecked') {
//         const from = parsed.info.source; // 发起者地址
//         const to = parsed.info.destination; // 接收者地址

//         const amount = ethers.formatUnits(parsed.info.tokenAmount.amount, parsed.info.tokenAmount.decimals); // 数据中是转账金额的字符串形式，需解析

//         console.log('From:', new PublicKey(from).toBase58());
//         console.log('To:', new PublicKey(to).toBase58());
//         console.log('Amount:', amount);
//         console.log("info", parsed.info)

//         // 检查是否是转账指令
//         //   const from = parsed.info.source;
//         //   const to = parsed.info.destination;
//         //   const amount = parsed.info.amount;
//         //   const mint = parsed.info.mint;

//         //   console.log('From:', new PublicKey(from).toBase58());
//         //   console.log('To:', new PublicKey(to).toBase58());
//         //   console.log('Amount:', amount);
//         //   console.log('Mint:', new PublicKey(mint).toBase58());
//       }
//     }
//   });
// });

// const tx = await connection.getParsedTransaction(
//   'TpZHMkPQjFAaciD9pm4rPFYoZLds4uYCDoAEjaGG3TU1FbL6agGRxcH39qNJKg7cujpijnh26hBdq55QsnFarTQ',
//   {
//     commitment: 'confirmed',
//     maxSupportedTransactionVersion: 0,
//   }
// );

// console.log('Status:', tx.meta.err ? 'Failed' : 'Confirmed');

// let response = await connection.getTokenAccountsByOwner(
//   ownerAddress, // owner here
//   {
//     programId: TOKEN_PROGRAM_ID,
//   },
// );

// response.value.forEach((item) => {
//   const accountInfo = AccountLayout.decode(item.account.data);
//   console.log('item', accountInfo.amount.toString());
// });

// const mintInfo = await connection.getParsedAccountInfo(mintAddress);
// const decimals = mintInfo.value.data.parsed.info.decimals;
// console.log("sdfsd", decimals)

// 生成 PDA
// const [pda, bump] = PublicKey.findProgramAddressSync(
//   [ownerAddress.toBuffer()],
//   new PublicKey(TOKEN_PROGRAM_ID),
// );

// console.log('pda', pda);

// const accounts = await connection.getParsedTokenAccountsByOwner(ownerAddress, {
//   programId: TOKEN_PROGRAM_ID,
// });

// console.log("accounts", accounts)

// accounts.value.forEach((account) => {
//   const mintAddress = account.account.data.parsed.info.mint;
//   console.log('Mint Address:', mintAddress);
// });

// const accountInfo = await getAccount(connection, pda);

// console.log('accountInfo', accountInfo);

// connection.getTokenAccountsByOwner

// async function findMintAddressByOwner(connection, ownerAddress) {
//     const TOKEN_PROGRAM_ID = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");

//     // 获取所有与该拥有者地址相关的 SPL 代币账户
//     const tokenAccounts = await connection.getTokenAccountsByOwner(
//         new PublicKey(ownerAddress),
//         { programId: TOKEN_PROGRAM_ID }
//     );

//     if (tokenAccounts.value.length === 0) {
//         console.log('该账户没有持有任何代币');
//         return;
//     }

//     console.log("tokenAccounts", tokenAccounts)

//     // 输出每个代币账户的 mint 地址
//     // tokenAccounts.value.forEach(({ account }) => {
//     //     const mintAddress = account.data.parsed.info.mint;
//     //     console.log(`找到的 mint 地址: ${mintAddress}`);
//     // });
// }

// // 示例使用
// const ownerAddress = 'D7zyyjwhbQAD3xSKhmRZ8swsMfqvPmseRqqvvpBozrvF'; // 替换为你要查询的账户地址

// (async () => {
//     await findMintAddressByOwner(connection, ownerAddress);
// })();

// 生成 PDA
// const [pda, bump] = await PublicKey.findProgramAddressSync(
//   [mintAddress.toBuffer(), ownerAddress.toBuffer()],
//   new PublicKey(TOKEN_PROGRAM_ID),
// );

// 获取账户的代币信息
// const tokenAccounts = await connection.getTokenAccountsByOwner(
//   new PublicKey('D7zyyjwhbQAD3xSKhmRZ8swsMfqvPmseRqqvvpBozrvF'),
//   { programId: TOKEN_PROGRAM_ID },
// );

// const tokenAddress = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr';

// console.log('tokenAccounts', tokenAccounts);

// // 查找指定代币的余额
// for (const { account } of tokenAccounts.value) {
//   //   const accountInfo = await getAccount(connection, account.pubkey);
//   console.log('accountInfo', account);
// }

//   if (accountInfo.mint.toString() === tokenAddress) {
//     console.log(`账户 ${walletAddress} 的代币余额: ${accountInfo.amount.toString()}`);
//     continue;
//   }
// }

// console.log('该账户没有持有该代币');

// const token = new Token(connection, new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"), TOKEN_PROGRAM_ID, null)
// const accounts = await token.getAccounts(new PublicKey(walletAddress));

// const tokens = await connection.getTokenAccountsByOwner(
//   new PublicKey('D7zyyjwhbQAD3xSKhmRZ8swsMfqvPmseRqqvvpBozrvF'),
//   {
//     programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
//   },
//   {
//     encoding: 'jsonParsed',
//   },
// );
// // const result = await connection.getTokenAccountBalance(new PublicKey('GX25EQsibPy8q4rnJJtFoAPrLtP3fsN6FfRyYwh3ugos'));
// console.log('sdfsdf', tokens);
