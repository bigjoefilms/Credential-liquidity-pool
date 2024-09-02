// /utils/stellarSdk.ts

import { Server, Keypair, Asset, LiquidityPoolId, TransactionBuilder, Operation, Networks, BASE_FEE } from 'stellar-sdk';

const server = new Server('https://horizon-testnet.stellar.org');

export const createLiquidityPool = async (
  sourceSecret: string,
  assetA: Asset,
  assetB: Asset,
  fee: number = 30
) => {
  const sourceKeypair = Keypair.fromSecret(sourceSecret);
  const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
  
  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
    .addOperation(Operation.liquidityPoolDeposit({
      liquidityPoolId: LiquidityPoolId.fromAssets(assetA, assetB, fee),
      maxAmountA: '100',
      maxAmountB: '100',
      minPrice: '0.1',
      maxPrice: '10',
    }))
    .setTimeout(30)
    .build();

  tx.sign(sourceKeypair);
  return server.submitTransaction(tx);
};

// Add more functions like depositToLiquidityPool, withdrawFromLiquidityPool, and pathPaymentUsingLiquidityPool
