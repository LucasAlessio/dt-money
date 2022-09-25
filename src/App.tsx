import { Dashboard } from "./components/Dashboard";
import { Header } from "./components/Header";
import { GlobalStyle } from "./styles/global";
import { createServer, Model, Response } from "miragejs";
import { QueryClient, QueryClientProvider } from "react-query";
import ReactModal from "react-modal";
import { useState } from "react";
import { NewTransactionModal, UpdateTransactionModal } from "./components/TransactionsModal";
import { TransactionsProvider } from "./hooks/useTransactions";

createServer({
	models: {
		transaction: Model,
	},

	seeds(server) {
		server.db.loadData({
			transactions: [{
				id: 1,
				title: 'Desenvolvimento',
				amount: 12000.00,
				type: 'deposit',
				category: 'Trabalho',
				createdAt: new Date('2021-02-20')
			}, {
				id: 2,
				title: 'Aluguel',
				amount: 1000.00,
				type: 'withdraw',
				category: 'Casa',
				createdAt: new Date('2021-02-17')
			}],
		});
	},

	routes() {
		this.namespace = "api";

		this.get('/transactions', (schema, request) => {
			return schema.all('transaction');
		});

		this.get('/transactions/:id', (schema, { params: { id } }) => {
			// return new Promise((resolve, _) => {
			// 	setTimeout(resolve, 2000);
			// }).then(() => {
			// 	return schema.findBy('transaction', { id: id });
			// });

			return schema.findBy('transaction', { id: id });
		});

		this.post('/transactions', (schema, { requestBody }) => {
			const data = JSON.parse(requestBody);

			return schema.create('transaction', data);
		});

		this.put('/transactions/:id', (schema, { params: { id }, requestBody }) => {
			const data = JSON.parse(requestBody);

			const transaction = schema.findBy('transaction', { id: id });

			if (!transaction) {
				return new Response(404, {
				 	some: 'header',
				}, {
				 	errors: ['Transação não encontrada'],
				});
			}

			transaction.update(data);
			return transaction;
		});

		this.delete('/transactions/:id', (schema, { params: { id }, requestBody }) => {
			const transaction = schema.findBy('transaction', { id: id });

			if (!transaction) {
				return new Response(404, {
				 	some: 'header',
				}, {
				 	errors: ['Transação não encontrada'],
				});
			}

			transaction.destroy();
			return id;
		});
	}
});

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: false,
		}
	}
})

ReactModal.setAppElement('#root');

export function App() {
	const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState<boolean>(false);
	
	const [transactionId, setTransactionId] = useState<number>(0);
	const [isUpdateTransactionModalOpen, setUpdateTransactionModalOpen] = useState<boolean>(false);

	function handleOpenNewTransactionModal() {
		setIsNewTransactionModalOpen(true);
	}

	function handleCloseNewTransactionModal() {
		setIsNewTransactionModalOpen(false);
	}

	function handleOpenUpdateTransactionModal(transactionId: number) {
		setTransactionId(transactionId);
		setUpdateTransactionModalOpen(true);
	}

	function handleCloseUpdateTransactionModal() {
		setTransactionId(0);
		setUpdateTransactionModalOpen(false);
	}

	return (
		<QueryClientProvider client={queryClient}>
			<TransactionsProvider>
				<GlobalStyle />
				<Header onOpenNewTransactionModal={handleOpenNewTransactionModal} />
				<Dashboard onOpenUpdateTransactionModal={handleOpenUpdateTransactionModal} />
				
				<NewTransactionModal
					isOpen={isNewTransactionModalOpen}
					onRequestClose={handleCloseNewTransactionModal} />
				
				<UpdateTransactionModal
					transactionId={transactionId}
					isOpen={isUpdateTransactionModalOpen}
					onRequestClose={handleCloseUpdateTransactionModal} />
			</TransactionsProvider>
		</QueryClientProvider>
	);
}
