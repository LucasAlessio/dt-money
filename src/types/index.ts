export type TransactionsList = {
	id: number,
	title: string,
	amount: number,
	type: "deposit" | "withdraw",
	category: string,
	createdAt: Date,
}[];

export type TransactionForm = Omit<TransactionsList[0], 'id' | 'createdAt'>;
