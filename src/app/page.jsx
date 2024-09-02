'use client';
import React, { useState } from 'react';
import {
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Box,
  CircularProgress,
  Link,
  Container,
  Divider,
  Card,
  CardContent,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Keypair,
  SorobanRpc,
  TransactionBuilder,
  Asset,
  Operation,
  LiquidityPoolAsset,
  getLiquidityPoolId,
  BASE_FEE,
  Networks,
} from '@stellar/stellar-sdk';

const server = new SorobanRpc.Server('https://soroban-testnet.stellar.org');

export default function Home() {
  const [keypair, setKeypair] = useState(null);
  const [log, setLog] = useState('');
  const [liquidityPoolId, setLiquidityPoolId] = useState('');
  const [assetName, setAssetName] = useState('');
  const [tokenAAmount, setTokenAAmount] = useState('');
  const [tokenBAmount, setTokenBAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState({
    generateKeypair: false,
    fundAccount: false,
    createLiquidityPool: false,
    withdrawFromPool: false,
  });

  const addLog = (message) => {
    setLog(message);
  };

  const generateKeypair = () => {
    setLoading((prev) => ({ ...prev, generateKeypair: true }));
    const newKeypair = Keypair.random();
    setKeypair(newKeypair);
    addLog(`Generated new keypair. Public key: ${newKeypair.publicKey()}`);
    setLoading((prev) => ({ ...prev, generateKeypair: false }));
  };

  const fundAccount = async () => {
    if (!keypair) {
      addLog('Please generate a keypair first.');
      return;
    }

    setLoading((prev) => ({ ...prev, fundAccount: true }));
    const friendbotUrl = `https://friendbot.stellar.org?addr=${keypair.publicKey()}`;
    try {
      const response = await fetch(friendbotUrl);
      if (response.ok) {
        addLog(`Account ${keypair.publicKey()} successfully funded.`);
      } else {
        addLog(`Something went wrong funding account: ${keypair.publicKey()}.`);
      }
    } catch (error) {
      addLog(`Error funding account ${keypair.publicKey()}: ${error.message}`);
    }
    setLoading((prev) => ({ ...prev, fundAccount: false }));
  };

  const createLiquidityPool = async () => {
    if (!keypair || !assetName || !tokenAAmount || !tokenBAmount) {
      addLog('Please ensure you have a keypair, asset name, and token amounts.');
      return;
    }

    setLoading((prev) => ({ ...prev, createLiquidityPool: true }));
    try {
      const account = await server.getAccount(keypair.publicKey());
      const customAsset = new Asset(assetName, keypair.publicKey());
      const lpAsset = new LiquidityPoolAsset(Asset.native(), customAsset, 30);
      const lpId = getLiquidityPoolId('constant_product', lpAsset).toString('hex');
      setLiquidityPoolId(lpId);

      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(Operation.changeTrust({ asset: lpAsset }))
        .addOperation(
          Operation.liquidityPoolDeposit({
            liquidityPoolId: lpId,
            maxAmountA: tokenAAmount,
            maxAmountB: tokenBAmount,
            minPrice: { n: 1, d: 1 },
            maxPrice: { n: 1, d: 1 },
          })
        )
        .setTimeout(30)
        .build();

      transaction.sign(keypair);
      const result = await server.sendTransaction(transaction);
      addLog(
        <>
          Liquidity Pool created. Transaction URL:{' '}
          <Link
            href={`https://stellar.expert/explorer/testnet/tx/${result.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            color="primary"
          >
            View Transaction
          </Link>
        </>
      );
    } catch (error) {
      addLog(`Error creating Liquidity Pool: ${error.message}`);
    }
    setLoading((prev) => ({ ...prev, createLiquidityPool: false }));
  };

  const withdrawFromPool = async () => {
    if (!keypair || !liquidityPoolId || !withdrawAmount) {
      addLog('Please ensure you have a keypair, liquidity pool ID, and withdrawal amount.');
      return;
    }

    setLoading((prev) => ({ ...prev, withdrawFromPool: true }));
    try {
      const account = await server.getAccount(keypair.publicKey());
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.liquidityPoolWithdraw({
            liquidityPoolId: liquidityPoolId,
            amount: withdrawAmount,
            minAmountA: '0',
            minAmountB: '0',
          })
        )
        .setTimeout(30)
        .build();

      transaction.sign(keypair);
      const result = await server.sendTransaction(transaction);
      addLog(
        <>
          Withdrawal successful. Transaction URL:{' '}
          <Link
            href={`https://stellar.expert/explorer/testnet/tx/${result.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            color="primary"
          >
            View Transaction
          </Link>
        </>
      );
    } catch (error) {
      addLog(`Error withdrawing from Liquidity Pool: ${error.message}`);
    }
    setLoading((prev) => ({ ...prev, withdrawFromPool: false }));
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 4,
      }}
    >
      <AppBar position="static" sx={{ backgroundColor: '#000000' ,borderRadius: '12px'}}>
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
            Credentials Liquidity Pool Manager
          </Typography>
        </Toolbar>
      </AppBar>
      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '16px' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Generate Keypair
              </Typography>
              <Button
                variant="contained"
                onClick={generateKeypair}
                fullWidth
                disabled={loading.generateKeypair}
                sx={{
                  backgroundColor: '#007bb5',
                  '&:hover': { backgroundColor: '#005f87' },
                  borderRadius: '8px',
                }}
              >
                {loading.generateKeypair ? <CircularProgress size={24} color="inherit" /> : 'Generate Keypair'}
              </Button>
              <Typography variant="h6" sx={{ mt: 4 }}>
                Fund Account
              </Typography>
              <Button
                variant="contained"
                onClick={fundAccount}
                fullWidth
                disabled={loading.fundAccount}
                sx={{
                  backgroundColor: '#e53935',
                  '&:hover': { backgroundColor: '#b71c1c' },
                  borderRadius: '8px',
                }}
              >
                {loading.fundAccount ? <CircularProgress size={24} color="inherit" /> : 'Fund Account'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '16px' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Create Pool
              </Typography>
              <TextField
                label="Asset Name"
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
                onChange={(e) => setAssetName(e.target.value)}
              />
              <TextField
                label="Token A Amount"
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
                onChange={(e) => setTokenAAmount(e.target.value)}
              />
              <TextField
                label="Token B Amount"
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
                onChange={(e) => setTokenBAmount(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={createLiquidityPool}
                fullWidth
                disabled={loading.createLiquidityPool}
                sx={{
                  backgroundColor: '#4caf50',
                  '&:hover': { backgroundColor: '#388e3c' },
                  borderRadius: '8px',
                }}
              >
                {loading.createLiquidityPool ? <CircularProgress size={24} color="inherit" /> : 'Create Liquidity Pool'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '16px' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Withdraw from Pool
              </Typography>
              <TextField
                label="Liquidity Pool ID"
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
                value={liquidityPoolId}
                onChange={(e) => setLiquidityPoolId(e.target.value)}
              />
              <TextField
                label="Withdrawal Amount"
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={withdrawFromPool}
                fullWidth
                disabled={loading.withdrawFromPool}
                sx={{
                  backgroundColor: '#ffa000',
                  '&:hover': { backgroundColor: '#ff8f00' },
                  borderRadius: '8px',
                }}
              >
                {loading.withdrawFromPool ? <CircularProgress size={24} color="inherit" /> : 'Withdraw from Pool'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Divider sx={{ width: '100%', my: 4 }} />
      <Box sx={{ width: '100%', backgroundColor: '#ffffff', p: 3, borderRadius: '8px' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Logs
        </Typography>
        <Box
          component="pre"
          sx={{
            backgroundColor: '#e8eaf6',
            p: 2,
            color: '#000',
            borderRadius: '8px',
            overflowY: 'auto',
            maxHeight: '200px',
          }}
        >
          {log}
        </Box>
      </Box>
    </Container>
  );
}
