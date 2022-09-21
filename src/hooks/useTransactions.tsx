import { createContext, ReactNode, useContext } from "react";
import { UseMutateAsyncFunction, useMutation, useQuery, useQueryClient, UseQueryResult } from "react-query";
import { TransactionsList, TransactionForm } from "../types";
import { api } from "../services/api";

type QueryResult = UseQueryResult<Record<"transactions", TransactionsList>, Error>;

type TransactionsContextData = {
	result: QueryResult,
	createTransaction: UseMutateAsyncFunction<Record<'transaction', TransactionsList[0]>, Error, TransactionForm, TContext>,
}

type TContext = {
	previousData: {
		transactions?: TransactionsList,
	}
};

const TransactionsContext = createContext<TransactionsContextData>({} as TransactionsContextData);

export function TransactionsProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();
	
	const result = useQuery<Record<'transactions', TransactionsList>, Error>('transactionsList', async () => {
		try {
			const { data } = await api.get('transactions');
			return data;
		} catch(error) {
			return Promise.reject(error);
		}
	});

	const { mutateAsync: createTransaction } = useMutation<Record<'transaction', TransactionsList[0]>, Error, TransactionForm, TContext>(async (newTransaction) => {
		const { data } = await api.post("transactions", {
			...(newTransaction),
			// Converte do formato 123.456,78 para 123456.78
			amount: Number(newTransaction.amount.toString().replaceAll(".", "").replace(",", ".")),
			createdAt: new Date(),
		});

		return data;
	}, {
		mutationKey: "createTransaction",
		
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

	return <TransactionsContext.Provider value={{ result, createTransaction }}>
		{ children }
	</TransactionsContext.Provider>
}

export function useTransactions() {
	const context = useContext(TransactionsContext);

	return context;
}
