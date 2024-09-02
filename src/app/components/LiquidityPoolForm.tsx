// /components/LiquidityPoolForm.tsx
"use client"
import React, { useState } from 'react';
import { createLiquidityPool } from '../utilis/stellarSdk';

const LiquidityPoolForm = () => {
  const [sourceSecret, setSourceSecret] = useState('');
  const [assetA, setAssetA] = useState('XLM');
  const [assetB, setAssetB] = useState('USD');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const assetObjA = new Asset(assetA, 'G...');
      const assetObjB = new Asset(assetB, 'G...');
      const response = await createLiquidityPool(sourceSecret, assetObjA, assetObjB);
      console.log('Liquidity Pool Created:', response);
    } catch (error) {
      console.error('Error creating liquidity pool:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        placeholder="Source Secret Key" 
        value={sourceSecret}
        onChange={(e) => setSourceSecret(e.target.value)}
        required
      />
      {/* Additional form fields for assetA, assetB, etc. */}
      <button type="submit">Create Liquidity Pool</button>
    </form>
  );
};

export default LiquidityPoolForm;
