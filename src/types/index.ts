export type Transaction = {
	id: number,
	title: string,
	amount: number,
	type: "deposit" | "withdraw",
	category: string,
	createdAt: Date,
}

export type TransactionsList = Transaction[];

export type TransactionForm = Partial<{ id: number, createdAt: Date }> & Omit<Transaction, 'id' | 'createdAt'>;
