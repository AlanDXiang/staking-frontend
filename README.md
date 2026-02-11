# 🪙 Web3 Staking dApp (Sepolia Testnet)

A decentralized application (dApp) that allows users to stake ERC20 tokens and earn rewards in real-time. Built with the modern Ethereum stack (**Next.js, RainbowKit, Wagmi**), this project demonstrates a complete DeFi lifecycle: staking, withdrawing, claiming rewards, and administrative pool management.

![Project Screenshot](https://public/screenshot.png)


## 🚀 Features

### 👤 User Features
* **Wallet Connection:** Seamless login with MetaMask, Rainbow, Coinbase Wallet, etc. (via RainbowKit).
* **Real-Time Data:** Live updates for Staked Balance, Earned Rewards, and Wallet Balance.
* **Staking Mechanics:** Approve and Deposit ERC20 tokens into the smart contract.
* **Rewards:** Claim accumulated rewards instantly without exiting your position.
* **Withdrawal:** Unstake tokens at any time.

### 🛡️ Admin Dashboard (Owner Only)
* *Exclusive control panel visible only to the contract owner.*
* **Set Duration:** Configure how long the staking epoch lasts (e.g., 7 days).
* **Fund Pool:** Inject reward tokens and start a new earning epoch (`notifyRewardAmount`).
* **Event Monitoring:** View exact start and end times for the current staking round.

## 🛠️ Tech Stack

* **Frontend:** [Next.js 14](https://nextjs.org/) (App Router), TypeScript, Tailwind CSS
* **Web3 Integration:** [Wagmi v2](https://wagmi.sh/), [Viem](https://viem.sh/)
* **Wallet UI:** [RainbowKit](https://www.rainbowkit.com/)
* **Smart Contracts:** Solidity (Hardhat environment)
* **Network:** Sepolia Testnet

## 📂 Project Structure

```bash
staking-frontend/
├── app/
│   ├── components/
│   │   └── StakingInterface.tsx  # Core logic (Staking + Admin Panel)
│   ├── constants.ts              # Contract Addresses & ABIs
│   ├── layout.tsx                # Global layout (Providers)
│   ├── page.tsx                  # Home page structure
│   └── providers.tsx             # Wagmi & QueryClient context
├── public/                       # Static assets
└── ...

```

## ⚡ Getting Started

### 1. Prerequisites

* Node.js (v18+)
* A browser wallet (MetaMask) with **Sepolia ETH**.

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone [https://github.com/AlanDXiang/staking-frontend.git](https://github.com/AlanDXiang/staking-frontend.git)
cd staking-dapp
npm install

```

### 3. Configuration

This frontend requires a deployed `StakingPool` contract and `RewardToken`.

1. Open `app/constants.ts`.
2. Replace the `STAKING_POOL_ADDRESS` and Token Addresses with your deployed contract addresses.
3. Paste the contract **ABI** (Application Binary Interface) from your Hardhat artifacts into the respective arrays.

### 4. Run Locally

```bash
npm run dev

```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) (or port 8088 as configured) to view the dApp.

## 📖 How to Use

1. **Connect Wallet:** Click the button in the top right to connect via MetaMask.
2. **Approve Tokens:** Enter an amount to stake. If it's your first time, click **Approve** to allow the contract to use your tokens.
3. **Stake:** Once approved, click **Stake** to deposit your tokens.
4. **Watch Rewards:** You will see your "Rewards" balance increase every second (block).
5. **Claim or Withdraw:** Click **Claim Rewards** to harvest yield, or switch to the **Withdraw** tab to exit your position.

## 🔐 Smart Contracts

*The contracts for this frontend are located in a separate Hardhat repository.*

* **StakingPool.sol:** Synthetix-based staking logic.
* **MockERC20.sol:** Used for both Staking Token (STK) and Reward Token (RWD).

## 📄 License

This project is open source and available under the [MIT License](https://www.google.com/search?q=LICENSE).

