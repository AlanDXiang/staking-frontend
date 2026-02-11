'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { STAKING_POOL_ADDRESS, STAKING_TOKEN_ADDRESS, REWARD_TOKEN_ADDRESS, STAKING_POOL_ABI, ERC20_ABI } from '../constants';

const OWNER_ADDRESS = "0x7ea278E9099eCee20D43c5c4C7E048b5EaE3fC93"; // Your Admin Wallet

export default function StakingInterface() {
    const { address, isConnected } = useAccount();
    const [amount, setAmount] = useState('');
    const [isStaking, setIsStaking] = useState(true);
    const [activeTab, setActiveTab] = useState<'stake' | 'withdraw' | 'stats'>('stake');

    // Admin State
    const [adminDuration, setAdminDuration] = useState('');
    const [adminRewardAmount, setAdminRewardAmount] = useState('');

    // --- READ DATA ---
    const { data: stakedBalance, refetch: refetchStaked } = useReadContract({
        address: STAKING_POOL_ADDRESS,
        abi: STAKING_POOL_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
    });

    const { data: earnedRewards, refetch: refetchEarned } = useReadContract({
        address: STAKING_POOL_ADDRESS,
        abi: STAKING_POOL_ABI,
        functionName: 'earned',
        args: address ? [address] : undefined,
    });

    const { data: tokenBalance } = useReadContract({
        address: STAKING_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
    });

    const { data: rewardTokenBalance } = useReadContract({
        address: REWARD_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
    });

    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: STAKING_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: address ? [address, STAKING_POOL_ADDRESS] : undefined,
    });

    // --- EVENT TIME DATA (For Human Readable Dates) ---
    const { data: finishAt, refetch: refetchFinishAt } = useReadContract({
        address: STAKING_POOL_ADDRESS,
        abi: STAKING_POOL_ABI,
        functionName: 'finishAt',
    });

    const { data: duration, refetch: refetchDuration } = useReadContract({
        address: STAKING_POOL_ADDRESS,
        abi: STAKING_POOL_ABI,
        functionName: 'duration',
    });

    // Additional Pool Stats
    const { data: totalSupply } = useReadContract({
        address: STAKING_POOL_ADDRESS,
        abi: STAKING_POOL_ABI,
        functionName: 'totalSupply',
    });

    const { data: rewardRate } = useReadContract({
        address: STAKING_POOL_ADDRESS,
        abi: STAKING_POOL_ABI,
        functionName: 'rewardRate',
    });

    const { data: rewardPerTokenStored } = useReadContract({
        address: STAKING_POOL_ADDRESS,
        abi: STAKING_POOL_ABI,
        functionName: 'rewardPerTokenStored',
    });

    const { data: updatedAt } = useReadContract({
        address: STAKING_POOL_ADDRESS,
        abi: STAKING_POOL_ABI,
        functionName: 'updatedAt',
    });

    // --- WRITE FUNCTIONS ---
    const { writeContract, data: hash, isPending } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    useEffect(() => {
        if (isConfirmed) {
            refetchStaked();
            refetchEarned();
            refetchAllowance();
            refetchFinishAt();
            refetchDuration();
            setAmount('');
            setAdminDuration('');
            setAdminRewardAmount('');
        }
    }, [isConfirmed]);

    // --- HELPERS ---

    // Convert Timestamp to Readable Date
    const formatTime = (timestamp: bigint | undefined) => {
        if (!timestamp || timestamp === 0n) return "N/A";
        return new Date(Number(timestamp) * 1000).toLocaleString();
    };

    // Calculate Start Time (Finish - Duration)
    const getStartTime = () => {
        if (!finishAt || !duration || finishAt === 0n) return "Not Started";
        const startTimestamp = Number(finishAt) - Number(duration);
        return new Date(startTimestamp * 1000).toLocaleString();
    };

    // Calculate APR (Annual Percentage Rate)
    const calculateAPR = () => {
        if (!rewardRate || !totalSupply || !duration || totalSupply === 0n) return "0";
        const yearInSeconds = 31536000;
        const annualRewards = Number(rewardRate) * yearInSeconds;
        const totalStakedValue = Number(totalSupply);
        const apr = (annualRewards / totalStakedValue) * 100;
        return apr.toFixed(2);
    };

    // Calculate time remaining
    const getTimeRemaining = () => {
        if (!finishAt || finishAt === 0n) return "Not Started";
        const now = Math.floor(Date.now() / 1000);
        const finish = Number(finishAt);
        if (now >= finish) return "Ended";
        const remaining = finish - now;
        const days = Math.floor(remaining / 86400);
        const hours = Math.floor((remaining % 86400) / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);
        return `${days}d ${hours}h ${minutes}m`;
    };

    // Calculate progress percentage
    const getProgressPercentage = () => {
        if (!finishAt || !duration || finishAt === 0n || duration === 0n) return 0;
        const now = Math.floor(Date.now() / 1000);
        const start = Number(finishAt) - Number(duration);
        const finish = Number(finishAt);
        if (now <= start) return 0;
        if (now >= finish) return 100;
        return ((now - start) / (finish - start)) * 100;
    };

    // --- HANDLERS ---

    const handleApprove = () => {
        writeContract({
            address: STAKING_TOKEN_ADDRESS,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [STAKING_POOL_ADDRESS, parseEther(amount)],
        });
    };

    const handleStake = () => {
        writeContract({
            address: STAKING_POOL_ADDRESS,
            abi: STAKING_POOL_ABI,
            functionName: 'stake',
            args: [parseEther(amount)],
        });
    };

    const handleWithdraw = () => {
        writeContract({
            address: STAKING_POOL_ADDRESS,
            abi: STAKING_POOL_ABI,
            functionName: 'withdraw',
            args: [parseEther(amount)],
        });
    };

    const handleClaim = () => {
        writeContract({
            address: STAKING_POOL_ADDRESS,
            abi: STAKING_POOL_ABI,
            functionName: 'getReward',
        });
    };

    const handleExit = () => {
        writeContract({
            address: STAKING_POOL_ADDRESS,
            abi: STAKING_POOL_ABI,
            functionName: 'exit',
        });
    };

    const handleMaxStake = () => {
        if (tokenBalance) {
            setAmount(formatEther(tokenBalance as bigint));
        }
    };

    const handleMaxWithdraw = () => {
        if (stakedBalance) {
            setAmount(formatEther(stakedBalance as bigint));
        }
    };

    // --- ADMIN HANDLERS ---

    const handleSetDuration = () => {
        writeContract({
            address: STAKING_POOL_ADDRESS,
            abi: STAKING_POOL_ABI,
            functionName: 'setRewardsDuration',
            args: [BigInt(adminDuration)], // Duration in seconds
        });
    };

    const handleNotifyReward = () => {
        writeContract({
            address: STAKING_POOL_ADDRESS,
            abi: STAKING_POOL_ABI,
            functionName: 'notifyRewardAmount',
            args: [parseEther(adminRewardAmount)],
        });
    };

    if (!isConnected) {
        return (
            <div className="w-full max-w-6xl mx-auto">
                <div className="text-center p-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl border border-gray-700 shadow-2xl">
                    <div className="text-6xl mb-6">🔒</div>
                    <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Connect Your Wallet
                    </h3>
                    <p className="text-gray-400">Please connect your wallet to start staking and earning rewards</p>
                </div>
            </div>
        );
    }

    const needsApproval = isStaking && allowance !== undefined && amount && allowance < parseEther(amount);
    const isOwner = address === OWNER_ADDRESS;
    const progressPercentage = getProgressPercentage();

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">

            {/* TOP STATS DASHBOARD */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 shadow-xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-purple-300">Your Staked</span>
                        <span className="text-2xl">💎</span>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">
                        {stakedBalance ? Number(formatEther(stakedBalance as bigint)).toFixed(4) : '0.00'}
                    </p>
                    <p className="text-xs text-purple-300">STK Tokens</p>
                </div>

                <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30 shadow-xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-green-300">Earned Rewards</span>
                        <span className="text-2xl">🎁</span>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">
                        {earnedRewards ? Number(formatEther(earnedRewards as bigint)).toFixed(4) : '0.00'}
                    </p>
                    <p className="text-xs text-green-300">RWD Tokens</p>
                </div>

                <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30 shadow-xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-blue-300">Current APR</span>
                        <span className="text-2xl">📈</span>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">
                        {calculateAPR()}%
                    </p>
                    <p className="text-xs text-blue-300">Annual Rate</p>
                </div>

                <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30 shadow-xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-orange-300">Time Remaining</span>
                        <span className="text-2xl">⏱️</span>
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">
                        {getTimeRemaining()}
                    </p>
                    <p className="text-xs text-orange-300">Until epoch ends</p>
                </div>
            </div>

            {/* EPOCH PROGRESS BAR */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl mb-6">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-gray-300">Staking Epoch Progress</h3>
                    <span className="text-sm text-gray-400">{progressPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 transition-all duration-500 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>Start: {getStartTime()}</span>
                    <span>End: {formatTime(finishAt as bigint)}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* MAIN STAKING INTERFACE */}
                <div className="lg:col-span-2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-2xl shadow-2xl overflow-hidden border border-gray-700">

                    {/* Header */}
                    <div className="p-6 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Staking Dashboard</h2>
                        <p className="text-sm text-gray-400 mt-1">Manage your stakes and rewards</p>
                    </div>

                    {/* Action Tabs */}
                    <div className="flex border-b border-gray-700">
                        <button
                            onClick={() => { setIsStaking(true); setActiveTab('stake'); }}
                            className={`flex-1 py-4 text-sm font-medium transition-all ${activeTab === 'stake' ? 'text-white border-b-2 border-purple-500 bg-gray-800/50' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'}`}
                        >
                            <span className="text-lg mr-2">📥</span>
                            Stake
                        </button>
                        <button
                            onClick={() => { setIsStaking(false); setActiveTab('withdraw'); }}
                            className={`flex-1 py-4 text-sm font-medium transition-all ${activeTab === 'withdraw' ? 'text-white border-b-2 border-purple-500 bg-gray-800/50' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'}`}
                        >
                            <span className="text-lg mr-2">📤</span>
                            Withdraw
                        </button>
                        <button
                            onClick={() => setActiveTab('stats')}
                            className={`flex-1 py-4 text-sm font-medium transition-all ${activeTab === 'stats' ? 'text-white border-b-2 border-purple-500 bg-gray-800/50' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'}`}
                        >
                            <span className="text-lg mr-2">📊</span>
                            Stats
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="p-6">
                        {activeTab === 'stats' ? (
                            // Stats View
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold mb-4 text-purple-400">Pool Statistics</h3>
                                
                                <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-400">Total Value Locked</span>
                                        <span className="text-lg font-bold text-white">
                                            {totalSupply ? Number(formatEther(totalSupply as bigint)).toFixed(2) : '0'} STK
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-400">Reward Rate (per second)</span>
                                        <span className="text-lg font-bold text-green-400">
                                            {rewardRate ? Number(formatEther(rewardRate as bigint)).toFixed(6) : '0'} RWD
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-400">Your Wallet Balance (STK)</span>
                                        <span className="text-lg font-bold text-purple-400">
                                            {tokenBalance ? Number(formatEther(tokenBalance as bigint)).toFixed(4) : '0'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-400">Your Wallet Balance (RWD)</span>
                                        <span className="text-lg font-bold text-green-400">
                                            {rewardTokenBalance ? Number(formatEther(rewardTokenBalance as bigint)).toFixed(4) : '0'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-400">Epoch Duration</span>
                                        <span className="text-lg font-bold text-blue-400">
                                            {duration ? `${Number(duration) / 86400} days` : 'Not Set'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-400">Last Update</span>
                                        <span className="text-sm text-gray-500">
                                            {updatedAt ? formatTime(updatedAt as bigint) : 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-4 border border-purple-500/30">
                                    <h4 className="font-bold text-purple-300 mb-2">Your Share</h4>
                                    <p className="text-3xl font-bold text-white">
                                        {totalSupply && stakedBalance && totalSupply > 0n
                                            ? ((Number(stakedBalance as bigint) / Number(totalSupply as bigint)) * 100).toFixed(2)
                                            : '0.00'
                                        }%
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">of total pool</p>
                                </div>
                            </div>
                        ) : (
                            // Stake/Withdraw View
                            <>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-300">Amount</label>
                                    <span className="text-xs text-gray-500">
                                        {isStaking ? 'Wallet' : 'Staked'}: {isStaking 
                                            ? (tokenBalance ? Number(formatEther(tokenBalance as bigint)).toFixed(4) : '0')
                                            : (stakedBalance ? Number(formatEther(stakedBalance as bigint)).toFixed(4) : '0')
                                        }
                                    </span>
                                </div>
                                
                                <div className="relative mb-4">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-700 rounded-xl p-4 pr-20 text-white text-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                        placeholder="0.0"
                                    />
                                    <button
                                        onClick={isStaking ? handleMaxStake : handleMaxWithdraw}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs font-bold transition"
                                    >
                                        MAX
                                    </button>
                                </div>

                                {isStaking ? (
                                    needsApproval ? (
                                        <button
                                            onClick={handleApprove}
                                            disabled={isPending || !amount}
                                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                                        >
                                            {isPending ? (
                                                <span className="flex items-center justify-center">
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Approving...
                                                </span>
                                            ) : '✅ Approve Tokens'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleStake}
                                            disabled={isPending || !amount}
                                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                                        >
                                            {isPending ? (
                                                <span className="flex items-center justify-center">
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Staking...
                                                </span>
                                            ) : '🚀 Stake Tokens'}
                                        </button>
                                    )
                                ) : (
                                    <button
                                        onClick={handleWithdraw}
                                        disabled={isPending || !amount}
                                        className="w-full py-4 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                                    >
                                        {isPending ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Withdrawing...
                                            </span>
                                        ) : '💸 Withdraw Tokens'}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* QUICK ACTIONS PANEL */}
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-xl">
                        <h3 className="text-lg font-bold mb-4 text-purple-400">Quick Actions</h3>
                        
                        <button
                            onClick={handleClaim}
                            disabled={!earnedRewards || earnedRewards === 0n || isPending}
                            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg mb-3"
                        >
                            <span className="text-xl mr-2">💰</span>
                            Claim Rewards
                        </button>

                        <button
                            onClick={handleExit}
                            disabled={!stakedBalance || stakedBalance === 0n || isPending}
                            className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                        >
                            <span className="text-xl mr-2">🚪</span>
                            Exit (Withdraw All + Claim)
                        </button>

                        <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                            <p className="text-xs text-blue-300 text-center">
                                💡 <span className="font-semibold">Tip:</span> Use Exit to withdraw everything and claim rewards in one transaction
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ADMIN ZONE (Only visible to Owner) */}
            {isOwner && (
                <div className="bg-gradient-to-br from-red-950/40 to-orange-950/40 backdrop-blur-xl border border-red-500/30 p-6 rounded-2xl shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="text-3xl">🛡️</div>
                        <div>
                            <h3 className="text-xl font-bold text-red-400">Owner Control Panel</h3>
                            <p className="text-xs text-red-300/70">Admin-only functions</p>
                        </div>
                    </div>

                    {/* Set Duration */}
                    <div className="mb-4 bg-gray-900/50 rounded-xl p-4 border border-red-900/50">
                        <label className="block text-sm font-medium text-red-300 mb-2">Set Duration (Seconds)</label>
                        <p className="text-xs text-gray-400 mb-3">Configure the staking epoch duration (e.g., 604800 = 7 days)</p>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="e.g. 604800"
                                value={adminDuration}
                                onChange={(e) => setAdminDuration(e.target.value)}
                                className="flex-1 bg-gray-950 border border-red-900 rounded-lg p-3 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                            />
                            <button
                                onClick={handleSetDuration}
                                disabled={isPending || !adminDuration}
                                className="px-6 bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 disabled:opacity-50 rounded-lg text-sm font-bold transition-all"
                            >
                                Set
                            </button>
                        </div>
                    </div>

                    {/* Notify Reward Amount */}
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-red-900/50">
                        <label className="block text-sm font-medium text-red-300 mb-2">Add Rewards & Start Epoch</label>
                        <p className="text-xs text-yellow-400/80 mb-3 flex items-start gap-2">
                            <span>⚠️</span>
                            <span>Ensure the contract has enough RWD tokens before starting the epoch</span>
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Amount of RWD"
                                value={adminRewardAmount}
                                onChange={(e) => setAdminRewardAmount(e.target.value)}
                                className="flex-1 bg-gray-950 border border-red-900 rounded-lg p-3 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                            />
                            <button
                                onClick={handleNotifyReward}
                                disabled={isPending || !adminRewardAmount}
                                className="px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 rounded-lg text-sm font-bold transition-all"
                            >
                                Notify
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transaction Status */}
            {isConfirming && (
                <div className="fixed bottom-8 right-8 bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-pulse border border-yellow-400/30">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-medium">Confirming transaction...</span>
                </div>
            )}
            
            {isConfirmed && (
                <div className="fixed bottom-8 right-8 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-green-400/30">
                    <span className="text-2xl">✅</span>
                    <span className="font-medium">Transaction confirmed!</span>
                </div>
            )}
        </div>
    );
}