'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { STAKING_POOL_ADDRESS, STAKING_TOKEN_ADDRESS, STAKING_POOL_ABI, ERC20_ABI } from '../constants';

const OWNER_ADDRESS = "0x7ea278E9099eCee20D43c5c4C7E048b5EaE3fC93"; // Your Admin Wallet

export default function StakingInterface() {
    const { address, isConnected } = useAccount();
    const [amount, setAmount] = useState('');
    const [isStaking, setIsStaking] = useState(true);

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

    if (!isConnected) return <div className="text-center p-10 text-gray-500">Please connect your wallet</div>;

    const needsApproval = isStaking && allowance !== undefined && amount && allowance < parseEther(amount);
    const isOwner = address === OWNER_ADDRESS;

    return (
        <div className="w-full max-w-md mx-auto space-y-8 mt-10">

            {/* MAIN STAKING INTERFACE */}
            <div className="bg-gray-900 text-white rounded-xl shadow-2xl overflow-hidden border border-gray-800">

                {/* Header Stats */}
                <div className="p-6 bg-gray-800 border-b border-gray-700">
                    <h2 className="text-xl font-bold mb-4 text-purple-400">Your Position</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-900 p-3 rounded-lg">
                            <p className="text-xs text-gray-400">Staked</p>
                            <p className="text-lg font-mono">{stakedBalance ? formatEther(stakedBalance as bigint) : '0'} STK</p>
                        </div>
                        <div className="bg-gray-900 p-3 rounded-lg border border-purple-500/20">
                            <p className="text-xs text-gray-400">Rewards</p>
                            <p className="text-lg font-mono text-green-400">{earnedRewards ? formatEther(earnedRewards as bigint) : '0'} RWD</p>
                        </div>
                    </div>

                    {/* Event Timer */}
                    <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-500/20 text-xs text-center text-blue-300">
                        <p><span className="font-bold">Event Starts:</span> {getStartTime()}</p>
                        <p><span className="font-bold">Event Ends:</span> {formatTime(finishAt as bigint)}</p>
                    </div>

                    <button
                        onClick={handleClaim}
                        disabled={!earnedRewards || earnedRewards === 0n || isPending}
                        className="w-full mt-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-sm font-bold rounded transition"
                    >
                        {isPending ? 'Processing...' : 'Claim Rewards'}
                    </button>
                </div>

                {/* Action Tabs */}
                <div className="flex border-b border-gray-700">
                    <button
                        onClick={() => setIsStaking(true)}
                        className={`flex-1 py-3 text-sm font-medium ${isStaking ? 'text-white border-b-2 border-purple-500 bg-gray-800' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Stake
                    </button>
                    <button
                        onClick={() => setIsStaking(false)}
                        className={`flex-1 py-3 text-sm font-medium ${!isStaking ? 'text-white border-b-2 border-purple-500 bg-gray-800' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Withdraw
                    </button>
                </div>

                {/* Input Area */}
                <div className="p-6">
                    <div className="flex justify-between mb-2">
                        <label className="text-xs text-gray-400">Amount</label>
                        <span className="text-xs text-gray-500">
                            Wallet Balance: {tokenBalance ? formatEther(tokenBalance as bigint) : '0'}
                        </span>
                    </div>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-700 rounded p-3 text-white mb-4 focus:outline-none focus:border-purple-500"
                        placeholder="0.0"
                    />

                    {isStaking ? (
                        needsApproval ? (
                            <button
                                onClick={handleApprove}
                                disabled={isPending}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded font-bold transition"
                            >
                                {isPending ? 'Approving...' : 'Approve Tokens'}
                            </button>
                        ) : (
                            <button
                                onClick={handleStake}
                                disabled={isPending || !amount}
                                className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded font-bold transition"
                            >
                                {isPending ? 'Staking...' : 'Stake'}
                            </button>
                        )
                    ) : (
                        <button
                            onClick={handleWithdraw}
                            disabled={isPending || !amount}
                            className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded font-bold transition"
                        >
                            {isPending ? 'Withdrawing...' : 'Withdraw'}
                        </button>
                    )}
                </div>
            </div>

            {/* ADMIN ZONE (Only visible to Owner) */}
            {isOwner && (
                <div className="bg-red-950/30 border border-red-500/30 p-6 rounded-xl">
                    <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2">
                        🛡️ Owner Control Panel
                    </h3>

                    {/* Set Duration */}
                    <div className="mb-4">
                        <label className="block text-xs text-red-300 mb-1">Set Duration (Seconds)</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="e.g. 604800 (7 days)"
                                value={adminDuration}
                                onChange={(e) => setAdminDuration(e.target.value)}
                                className="flex-1 bg-gray-900 border border-red-900 rounded p-2 text-sm"
                            />
                            <button
                                onClick={handleSetDuration}
                                disabled={isPending || !adminDuration}
                                className="px-4 bg-red-800 hover:bg-red-700 rounded text-sm font-bold"
                            >
                                Set
                            </button>
                        </div>
                    </div>

                    {/* Notify Reward Amount */}
                    <div>
                        <label className="block text-xs text-red-300 mb-1">Add Rewards & Start Epoch</label>
                        <p className="text-[10px] text-gray-400 mb-2">
                            *Ensure contract has enough RWD tokens before clicking.
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Amount of RWD"
                                value={adminRewardAmount}
                                onChange={(e) => setAdminRewardAmount(e.target.value)}
                                className="flex-1 bg-gray-900 border border-red-900 rounded p-2 text-sm"
                            />
                            <button
                                onClick={handleNotifyReward}
                                disabled={isPending || !adminRewardAmount}
                                className="px-4 bg-red-600 hover:bg-red-500 rounded text-sm font-bold"
                            >
                                Notify
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isConfirming && <p className="text-center text-xs text-yellow-500 animate-pulse pb-10">Confirming transaction...</p>}
        </div>
    );
}