// Write JavaScript Code
import bs58 from 'bs58';
import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js';

import { getOrCreateAssociatedTokenAccount, transfer } from '@solana/spl-token';
// Replace these with your own keys and desired transfer amount
const PRIVATE_KEY = bs58.encode(Buffer.from([]))
console.log("PRIVATE_KEY", PRIVATE_KEY)
const RECEIVER_PUBLIC_KEY = ''; // Receiver's public key
const TRANSFER_AMOUNT = 10000000; // 10 amount of USDC to transfer (in smallest unit)
// The address of the USDC token on Solana Devnet
const USDC_DEV_PUBLIC_KEY = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';
// Convert the private key from Base58 to a byte array and create a Keypair
const senderPrivateKeyBytes = bs58.decode(PRIVATE_KEY);
const senderKeypair = Keypair.fromSecretKey(senderPrivateKeyBytes);
// Create a new connection to the Solana Devnet
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
(async () => {
  try {
    // Fetch the sender's USDC token account
    const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      senderKeypair,
      new PublicKey(USDC_DEV_PUBLIC_KEY),
      senderKeypair.publicKey,
    );
    // Fetch or create the receiver's associated token account for USDC
    const receiverTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      senderKeypair,
      new PublicKey(USDC_DEV_PUBLIC_KEY),
      new PublicKey(RECEIVER_PUBLIC_KEY),
      true, // Allow creating a token account for the receiver if it doesn't exist
    );
    // Perform the transfer
    const signature = await transfer(
      connection,
      senderKeypair,
      senderTokenAccount.address,
      receiverTokenAccount.address,
      senderKeypair.publicKey,
      TRANSFER_AMOUNT,
    );
    // Log the transaction signature
    console.log(`Transaction signature: ${signature}`);
    console.log(`You can verify the transaction on https://explorer.solana.com/tx/${signature}?cluster=devnet`);
  } catch (error) {
    console.error('Error performing the transfer:', error);
  }
})();
