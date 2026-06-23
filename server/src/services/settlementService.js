/**
 * Smart Settlement Engine
 * Calculates who owes whom and minimizes the number of transactions.
 */

class SettlementService {
    /**
     * @param {Array} members - List of members with their net balances
     * balance > 0: member is owed (creditor)
     * balance < 0: member owes (debtor)
     */
    calculateSettlements(members) {
        const debtors = [];
        const creditors = [];

        members.forEach(member => {
            if (member.balance < 0) {
                debtors.push({ id: member.id, name: member.name, balance: Math.abs(member.balance) });
            } else if (member.balance > 0) {
                creditors.push({ id: member.id, name: member.name, balance: member.balance });
            }
        });

        // Sort both by balance descending to match largest debtor with largest creditor
        debtors.sort((a, b) => b.balance - a.balance);
        creditors.sort((a, b) => b.balance - a.balance);

        const settlements = [];
        let i = 0; // debtor index
        let j = 0; // creditor index

        while (i < debtors.length && j < creditors.length) {
            const amount = Math.min(debtors[i].balance, creditors[j].balance);

            settlements.push({
                from: debtors[i].id,
                fromName: debtors[i].name,
                to: creditors[j].id,
                toName: creditors[j].name,
                amount: Number(amount.toFixed(2))
            });

            debtors[i].balance -= amount;
            creditors[j].balance -= amount;

            if (debtors[i].balance < 0.01) i++;
            if (creditors[j].balance < 0.01) j++;
        }

        return settlements;
    }

    async getRoomSettlements(expenses, members) {
        const balances = {};
        members.forEach(m => balances[m.user_id] = 0);

        expenses.forEach(exp => {
            // Paid by
            balances[exp.paid_by] += Number(exp.amount);

            // Splits (What each person owes)
            exp.splits.forEach(split => {
                balances[split.user_id] -= Number(split.amount);
            });
        });

        const memberBalances = members.map(m => ({
            id: m.user_id,
            name: m.full_name,
            balance: balances[m.user_id]
        }));

        return this.calculateSettlements(memberBalances);
    }
}

module.exports = new SettlementService();
