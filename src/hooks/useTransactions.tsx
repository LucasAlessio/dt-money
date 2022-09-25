import { createContext, ReactNode, useContext } from "react";
import { UseMutateAsyncFunction, useMutation, useQuery, useQueryClient, UseQueryResult } from "react-query";
import { TransactionsList, TransactionForm, Transaction } from "../types";
import { api } from "../services/api";

type QueryResult = UseQueryResult<Record<"transactions", TransactionsList>, Error>;

type TContext = {
	previousData: {
		transactions?: TransactionsList,
	}
};

export type TransactionsApiFunction = UseMutateAsyncFunction<Record<'transaction', Transaction>, Error, TransactionForm, TContext>;

type TransactionsContextData = {
	result: QueryResult,
	transactionId?: number | null,
	createTransaction: TransactionsApiFunction,
	updateTransaction: TransactionsApiFunction,
	deleteTransaction: UseMutateAsyncFunction<number, Error, number, TContext>
}

const TransactionsContext = createContext<TransactionsContextData>({} as TransactionsContextData);

export function TransactionsProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();
	
	const result = useQuery<Record<'transactions', TransactionsList>, Error>(['transactionsList'], async () => {
		try {
			const { data } = await api.get('transactions');
			return data;
		} catch(error) {
			return Promise.reject(error);
		}
	});

	const { mutateAsync: createTransaction } = useMutation<Record<'transaction', Transaction>, Error, TransactionForm, TContext>(async (newTransaction) => {
		const { data } = await api.post("transactions", {
			...(newTransaction),
			// Converte do formato 123.456,78 para 123456.78
			amount: Number(newTransaction.amount.toString().replaceAll(".", "").replace(",", ".")),
			createdAt: new Date(),
		});

		return data;
	}, {
		mutationKey: ["saveTransaction", "createTransaction"],
		
		// When mutate is called:
		onMutate: async (newTransaction) => {
			// Cancelando todas as novas buscas (para que elas não substituam nossa atualização otimista)
			await queryClient.cancelQueries('transactionsList');

			// Snapshot do valor anterior
			const previousData = queryClient.getQueryData('transactionsList');

			// Retorna um objeto de contexto com o valor snapshotted
			return { previousData } as TContext;
		},

		onSuccess: (newTransaction) => {
			//Optimistically update to the new value
			queryClient.setQueryData('transactionsList', (old?: Record<"transactions", TransactionsList>) => {
				return {
					transactions: [
						...(old?.transactions || []),
						newTransaction.transaction,
					],
				} as Record<'transactions', TransactionsList>;
			});
		},

		// Se a mutation falhar, usa-se o contexto retornado de onMutate para reverter
		onError: (err, newTransaction, context) => {
		 	queryClient.setQueryData('transactionsList', (context?.previousData || []));
		},
	});

	const { mutateAsync: updateTransaction } = useMutation<Record<'transaction', Transaction>, Error, TransactionForm, TContext>(async (transaction) => {
		const { data } = await api.put(`transactions/${transaction.id ?? 0}`, {
			...(transaction),
			// Converte do formato 123.456,78 para 123456.78
			amount: Number(transaction.amount.toString().replaceAll(".", "").replace(",", ".")),
		});

		return data;
	}, {
		mutationKey: ["saveTransaction", "updateTransaction"],
		
		// When mutate is called:
		onMutate: async (transactionForm) => {
			// Cancelando todas as novas buscas (para que elas não substituam nossa atualização otimista)
			await queryClient.cancelQueries('transactionsList');

			// Snapshot do valor anterior
			const previousData = queryClient.getQueryData('transactionsList');

			// Retorna um objeto de contexto com o valor snapshotted
			return { previousData } as TContext;
		},

		onSuccess: (updatedTransaction) => {			
			//Optimistically update to the new value
			queryClient.setQueryData('transactionsList', (old?: Record<"transactions", TransactionsList>) => {
				const transactions = old?.transactions.map((value: Transaction) =>  {
					if (value.id === updatedTransaction.transaction.id) {
						return updatedTransaction.transaction;
					}

					return value;
				});

				return { transactions } as Record<'transactions', TransactionsList>;
			});
		},

		// Se a mutation falhar, usa-se o contexto retornado de onMutate para reverter
		onError: (err, transaction, context) => {
		 	queryClient.setQueryData('transactionsList', (context?.previousData || []));
		},
	});

	const { mutateAsync: deleteTransaction } = useMutation<number, Error, number, TContext>(async (transactionId) => {
		const { data } = await api.delete(`transactions/${transactionId ?? 0}`);

		return data;
	}, {
		mutationKey: "deleteTransaction",
		
		// When mutate is called:
		onMutate: async (transactionId) => {
			// Cancelando todas as novas buscas (para que elas não substituam nossa atualização otimista)
			await queryClient.cancelQueries('transactionsList');

			// Snapshot do valor anterior
			const previousData = queryClient.getQueryData('transactionsList');

			// Retorna um objeto de contexto com o valor snapshotted
			return { previousData } as TContext;
		},

		onSuccess: (deletedTransaction) => {			
			//Optimistically update to the new value
			queryClient.setQueryData('transactionsList', (old?: Record<"transactions", TransactionsList>) => {
				const transactions = old?.transactions.map((value: Transaction) =>  {
					if (Number(value.id) !== deletedTransaction) {
						return value;
					}

					return null;
				}).filter((value: Transaction | null) => {
					return value !== null;
				});

				return { transactions } as Record<'transactions', TransactionsList>;
			});
		},

		// Se a mutation falhar, usa-se o contexto retornado de onMutate para reverter
		onError: (err, transaction, context) => {
		 	queryClient.setQueryData('transactionsList', (context?.previousData || []));
		},
	});

	return <TransactionsContext.Provider value={{ result, createTransaction, updateTransaction, deleteTransaction }}>
		{ children }
	</TransactionsContext.Provider>
}

export function useTransactions() {
	const context = useContext(TransactionsContext);

	return context;
}
