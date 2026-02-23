# 🛡️ Admin Panel Workflow Guide

## Overview
This guide explains the correct workflow for using the Owner Control Panel to set up staking epochs.

## ⚠️ Why Owner Functions Were Failing

### Problem 1: setRewardsDuration
**Contract Requirement (Line 168):**
```solidity
require(finishAt < block.timestamp, "Reward duration not finished");
```

**Issue**: You can ONLY set duration when:
- No epoch has started yet (finishAt = 0), OR
- The current epoch has completely ended (current time > finishAt)

**Fix**: UI now checks epoch status and disables the button until condition is met.

---

### Problem 2: notifyRewardAmount
**Contract Requirements (Line 178-190):**
```solidity
// Needs duration to calculate rate
rewardRate = _amount / duration;  // Fails if duration = 0!

// Needs enough tokens in contract
require(
    rewardRate * duration <= rewardsToken.balanceOf(address(this)),
    "Reward amount > balance"
);
```

**Issues**: 
1. Duration must be set first (can't divide by zero)
2. Contract must have enough RWD tokens

**Fix**: UI validates both conditions before enabling the button.

---

## ✅ Correct Workflow

### First Time Setup (No Epoch Ever Started)

**Status Check:**
- Epoch Status: ✅ Ended / Not Started
- Duration Set: ❌ Not Set
- Contract RWD Balance: Shows current balance

**Steps:**

1. **Set Duration**
   ```
   - Click quick button (e.g., "7 Days") OR
   - Enter seconds manually (604800 = 7 days)
   - Click "Set" button
   - Wait for transaction to confirm
   ```
   
   **Result**: Duration Set changes to ✅ 7 days

2. **Transfer RWD Tokens to Contract** (if not done)
   ```
   - Use your wallet to send RWD tokens to contract address
   - Amount should be >= what you plan to distribute
   - UI shows contract balance in real-time
   ```

3. **Start Epoch**
   ```
   - Enter reward amount (e.g., 1000 RWD)
   - UI validates: ✅ Contract has enough RWD tokens
   - UI shows: Estimated APR based on current TVL
   - Click "Start" button
   - Wait for transaction to confirm
   ```
   
   **Result**: Epoch starts, users can now stake and earn rewards!

---

### Setting Up Next Epoch (After First One Ends)

**Status Check:**
- Epoch Status: 🔄 Active → Wait for countdown to reach 0
- When countdown ends: ✅ Ended

**Steps:**

1. **Wait for Current Epoch to End**
   ```
   - Dashboard shows: Time Remaining: Xd Xh Xm
   - Wait until it shows "Ended"
   - Epoch Status becomes: ✅ Ended
   ```

2. **Set New Duration** (if you want to change it)
   ```
   - Choose new duration with quick buttons or custom
   - Click "Set"
   - Or skip if keeping same duration
   ```

3. **Add More Rewards**
   ```
   - Ensure contract still has RWD (or add more)
   - Enter reward amount
   - Click "Start"
   ```

---

## 🎯 UI Validation System

### Set Duration Button States

| Condition | Button State | Visual Indicator |
|-----------|--------------|------------------|
| Epoch still active | Disabled | ⚠️ "Epoch must end first" |
| Epoch ended, no input | Disabled | Gray out |
| Epoch ended, input valid | Enabled | Red gradient |
| Transaction pending | Disabled | ⏳ symbol |

### Notify Reward Button States

| Condition | Button State | Message |
|-----------|--------------|---------|
| Duration not set | Disabled | ⚠️ "Set duration first" |
| Not enough RWD in contract | Disabled | ❌ "Contract doesn't have enough RWD" |
| All conditions met | Enabled | ✅ "Contract has enough RWD. Ready!" |
| Transaction pending | Disabled | ⏳ symbol |

---

## 📊 Understanding the Status Dashboard

### Epoch Status
- **✅ Ended / Not Started**: Safe to set duration and start new epoch
- **🔄 Active**: Must wait for countdown to finish

### Duration Set
- **✅ X days**: Duration configured, ready for notify
- **❌ Not Set**: Must set duration before notifying rewards

### Contract RWD Balance
- Shows real-time RWD token balance in the contract
- Must be >= reward amount you want to distribute

---

## 🔢 Quick Duration Reference

| Button | Seconds | Use Case |
|--------|---------|----------|
| 1 Day | 86,400 | Testing |
| 3 Days | 259,200 | Short campaigns |
| 7 Days | 604,800 | Weekly rewards |
| 14 Days | 1,209,600 | Bi-weekly |
| 30 Days | 2,592,000 | Monthly |

**Custom**: Enter any value in seconds

---

## 💡 Tips & Best Practices

### 1. Check Contract Balance First
```
Always verify contract has enough RWD before starting epoch:
Contract Balance >= Reward Amount
```

### 2. Calculate Expected APR
```
UI shows estimated APR based on:
- Your reward amount
- Duration
- Current Total Value Locked (TVL)

Formula: (rewardRate × 31,536,000 / totalSupply) × 100
```

### 3. Use Quick Duration Buttons
```
Faster than calculating seconds manually
Prevents typos (e.g., 60480 vs 604800)
```

### 4. Wait for Confirmations
```
Each transaction needs blockchain confirmation
Don't spam the buttons
Watch for success/error messages
```

### 5. Monitor Help Section
```
Click "💡 Help" to see workflow checklist
Green checkmarks show completed steps
Bold items show current step
```

---

## 🐛 Troubleshooting

### "Transaction Likely to Fail" - Set Duration

**Cause**: Epoch hasn't ended yet

**Solution**:
1. Check "Time Remaining" counter
2. Wait for it to show "Ended"
3. Epoch Status should be ✅ before you can set duration

---

### "Transaction Likely to Fail" - Notify Reward

**Possible Causes & Solutions**:

1. **Duration not set**
   - Status shows: ❌ Duration Set: Not Set
   - Solution: Complete Step 1 first (Set Duration)

2. **Not enough RWD in contract**
   - Status shows: Contract RWD Balance < your input
   - Solution: Transfer more RWD to contract first

3. **Reward amount too low**
   - Contract requires: rewardRate > 0
   - Solution: Increase reward amount or decrease duration

4. **Division calculation error**
   - Happens if duration = 0 somehow
   - Solution: Refresh page and set duration again

---

### "Network Fee" Error

**Cause**: Not enough ETH for gas

**Solution**: 
- Add Sepolia ETH to your wallet
- Use faucet: https://sepoliafaucet.com/

---

### Button Stays Disabled

**Debugging Steps**:
1. Check Epoch Status - must be ✅ Ended
2. Check Duration Set - must show value for notify
3. Check Contract Balance - must be >= input amount
4. Refresh page to reload contract state
5. Disconnect and reconnect wallet

---

## 📱 Visual Guide

### Step 1: Check Status
```
╔══════════════════════════════════╗
║ 📊 Current Status                ║
╠══════════════════════════════════╣
║ Epoch Status: ✅ Ended           ║  ← Must be green
║ Duration Set: ❌ Not Set         ║  ← Will change after Step 2
║ Contract RWD: 21,400 RWD         ║  ← Check this is enough
╚══════════════════════════════════╝
```

### Step 2: Set Duration
```
╔══════════════════════════════════╗
║ Step 1: Set Duration (Seconds)  ║
║ ⚠️ Epoch must end first          ║  ← Warning if epoch active
╠══════════════════════════════════╣
║ [1 Day][3 Days][7 Days]...      ║  ← Quick buttons
║ [604800____________] [Set]       ║  ← Input & button
║ = 7.00 days                      ║  ← Calculated display
╚══════════════════════════════════╝
```

### Step 3: Start Epoch
```
╔══════════════════════════════════╗
║ Step 2: Add Rewards & Start     ║
║ ✅ Contract has enough RWD       ║  ← Validation passed
╠══════════════════════════════════╣
║ [1000______________] [Start]     ║
║                                  ║
║ Estimated APR: 52.38%            ║  ← Preview
║ Based on TVL: 1,000 STK          ║
╚══════════════════════════════════╝
```

---

## 🎓 Understanding the Contract Logic

### Why These Requirements Exist

**1. Epoch Must End Before New Duration**
- Prevents changing rules mid-game
- Ensures fair distribution to existing stakers
- Avoids complex recalculations

**2. Duration Must Be Set Before Rewards**
- Used in formula: `rewardRate = amount / duration`
- Determines how fast rewards are distributed
- Lower duration = higher reward rate (APR)

**3. Contract Must Hold Tokens**
- Contract distributes from its own balance
- Prevents promises it can't keep
- Safety check: `rewardRate × duration <= balance`

---

## 🔗 Contract Code Reference

```solidity
// Line 167-170: Set Duration
function setRewardsDuration(uint256 _duration) external onlyOwner {
    require(finishAt < block.timestamp, "Reward duration not finished");
    duration = _duration;
}

// Line 173-202: Notify Reward
function notifyRewardAmount(uint256 _amount) external onlyOwner {
    // Calculate rate based on duration
    rewardRate = _amount / duration;
    
    // Verify contract can fulfill
    require(rewardRate > 0, "Reward rate too low");
    require(
        rewardRate * duration <= rewardsToken.balanceOf(address(this)),
        "Reward amount > balance"
    );
    
    // Set new finish time
    finishAt = uint32(block.timestamp + duration);
}
```

---

## ✅ Success Indicators

**When Everything is Working:**

1. ✅ Set Duration completes → Status shows duration in days
2. ✅ Notify Reward completes → Epoch Progress Bar starts moving
3. ✅ Users can stake → Pool Statistics shows increasing TVL
4. ✅ Rewards accumulate → User cards show growing "Earned Rewards"

---

## 📞 Still Having Issues?

If you've followed this guide and still experiencing problems:

1. **Check Contract State**:
   - Open block explorer (Sepolia Etherscan)
   - View contract at: `0x11f405b2b36d884f671ce40a645fa60ea412f917`
   - Check `finishAt`, `duration`, `rewardRate` values

2. **Verify Wallet**:
   - Confirm you're connected as owner
   - Check wallet has Sepolia ETH for gas

3. **Browser Console**:
   - Open developer tools (F12)
   - Check for JavaScript errors
   - Look for failed contract calls

4. **Try Again Later**:
   - Sometimes network congestion causes issues
   - Wait a few minutes and retry

---

## 📝 Summary Checklist

**Before Setting Duration:**
- [ ] Epoch Status shows ✅ Ended / Not Started
- [ ] Wallet connected as owner
- [ ] Have Sepolia ETH for gas

**Before Notifying Rewards:**
- [ ] Duration is set (shows in status)
- [ ] Contract has >= reward amount in RWD
- [ ] Wallet has Sepolia ETH for gas

**After Successful Setup:**
- [ ] Epoch Progress Bar is moving
- [ ] Time Remaining shows countdown
- [ ] Users can stake and see rewards accumulate

---

**Last Updated**: After PR #1 fixes
**Contract**: Staking.sol (Synthetix-based)
**Network**: Sepolia Testnet
