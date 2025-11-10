"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import contractABI from "../contract_data/GetSet.json";
import contractAddress from "../contract_data/GetSet-address.json";

export default function Page() {
  const [value, setValue] = useState(""); 
  const [retrievedValue, setRetrievedValue] = useState(null);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [userBalance, setUserBalance] = useState(null);

  // Initialize Provider, Signer, and Contract
  const initializeEthers = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected!");
      return;
    }

    try {
      const _provider = new ethers.BrowserProvider(window.ethereum);
      const _signer = await _provider.getSigner();
      const _contract = new ethers.Contract(contractAddress.address, contractABI.abi, _signer);

      setProvider(_provider);
      setSigner(_signer);
      setContract(_contract);

      const accounts = await _provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Error initializing ethers:", error);
    }
  };

  // Set value in contract
  const setContractValue = async () => {
    if (!contract) return alert("Please connect wallet first!");
    try {
      const tx = await contract.set(BigInt(value)); // Convert string to BigInt
      await tx.wait(); // Wait for transaction confirmation
      alert("Value set successfully!");
    } catch (error) {
      console.error("Error setting value:", error);
    }
  };

  // Get value from contract
  const getContractValue = async () => {
    if (!contract) return alert("Please connect wallet first!");
    try {
      const result = await contract.get();
      setRetrievedValue(result.toString());
    } catch (error) {
      console.error("Error getting value:", error);
    }
  };

  // Deposit funds to the contract
  const depositFunds = async () => {
    if (!contract) return alert("Please connect wallet first!");
    try {
      const tx = await signer.sendTransaction({
        to: contractAddress.address,
        value: ethers.parseEther(depositAmount), // Convert to wei
      });
      await tx.wait();
      alert(`Deposited ${depositAmount} ETH successfully!`);
      setDepositAmount("");
    } catch (error) {
      console.error("Error depositing funds:", error);
    }
  };

  // Get user balance
  const getUserBalance = async () => {
    if (!contract) return alert("Please connect wallet first!");
    try {
      const balance = await contract.getBalance(account);
      setUserBalance(ethers.formatEther(balance)); // Convert from wei to ETH
    } catch (error) {
      console.error("Error getting balance:", error);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      initializeEthers();
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">GetSet Contract</h1>

      {/* Wallet Connection */}
      {account ? (
        <p className="mb-4">Connected: {account}</p>
      ) : (
        <button 
          onClick={initializeEthers} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md mb-4"
        >
          Connect Wallet
        </button>
      )}

      {/* Input Field for Setting Value */}
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter value"
        className="border px-4 py-2 mb-4"
      />
      <button 
        onClick={setContractValue} 
        className="px-4 py-2 bg-green-600 text-white rounded-md mb-4"
      >
        Set Value
      </button>

      {/* Get Value Button */}
      <button 
        onClick={getContractValue} 
        className="px-4 py-2 bg-purple-600 text-white rounded-md mb-4"
      >
        Get Value
      </button>

      {/* Display Retrieved Value */}
      {retrievedValue !== null && (
        <p className="text-lg font-bold">Stored Value: {retrievedValue}</p>
      )}

      {/* Deposit Funds */}
      <input
        type="text"
        value={depositAmount}
        onChange={(e) => setDepositAmount(e.target.value)}
        placeholder="Enter ETH to deposit"
        className="border px-4 py-2 mb-4"
      />
      <button 
        onClick={depositFunds} 
        className="px-4 py-2 bg-yellow-600 text-white rounded-md mb-4"
      >
        Deposit Funds
      </button>

      {/* Get User Balance */}
      <button 
        onClick={getUserBalance} 
        className="px-4 py-2 bg-red-600 text-white rounded-md mb-4"
      >
        Get Balance
      </button>

      {userBalance !== null && (
        <p className="text-lg font-bold">Your Balance: {userBalance} ETH</p>
      )}
    </div>
  );
}