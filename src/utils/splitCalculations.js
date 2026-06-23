/**
 * Calculate net balances for each member in a room.
 * Returns an object { memberName: netBalance } where +ve means they are owed, -ve means they owe.
 */
export const calculateNetBalances = (members, expenses, settlements) => {
    const balances = {};
    members.forEach(m => balances[m.name] = 0);

    // 1. Process Expenses
    expenses.forEach(exp => {
        const paidBy = exp.createdBy;
        const amount = exp.amount;

        // The person who paid is owed the total minus their own share
        const payerShare = exp.splits.find(s => s.memberName === paidBy)?.amount || 0;
        balances[paidBy] += (amount - payerShare);

        // Others owe their respective split amounts
        exp.splits.forEach(split => {
            if (split.memberName !== paidBy) {
                balances[split.memberName] -= split.amount;
            }
        });
    });

    // 2. Process Settlements
    settlements.forEach(settle => {
        // From (payer) owes less, To (receiver) is owed less
        balances[settle.from] += settle.amount;
        balances[settle.to] -= settle.amount;
    });

    return balances;
};

/**
 * Generate a list of "Who Owes Whom" based on net balances.
 * This is a classic "simplify debts" algorithm.
 */
export const simplifyDebts = (balances) => {
    const payers = [];
    const receivers = [];

    // Separate into debtors and creditors
    Object.entries(balances).forEach(([name, bal]) => {
        if (bal < -0.01) payers.push({ name, amount: Math.abs(bal) });
        else if (bal > 0.01) receivers.push({ name, amount: bal });
    });

    const instructions = [];
    let pi = 0;
    let ri = 0;

    while (pi < payers.length && ri < receivers.length) {
        const payer = payers[pi];
        const receiver = receivers[ri];
        const settleAmount = Math.min(payer.amount, receiver.amount);

        instructions.push({
            from: payer.name,
            to: receiver.name,
            amount: settleAmount
        });

        payer.amount -= settleAmount;
        receiver.amount -= settleAmount;

        if (payer.amount < 0.01) pi++;
        if (receiver.amount < 0.01) ri++;
    }

    return instructions;
};
