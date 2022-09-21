import { Dashboard } from "./components/Dashboard";
import { Header } from "./components/Header";
import { GlobalStyle } from "./styles/global";
import { createServer, Model } from "miragejs";
import { QueryClient, QueryClientProvider } from "react-query";
import ReactModal from "react-modal";
import { useState } from "react";
import { NewTransactionModal } from "./components/NewTransactionModal";
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
			}]
		})
	},

	routes() {
		this.namespace = "api";

		this.get('/transactions', () => {
			// return new Response(400, {
			// 	some: 'header',
			// }, {
			// 	errors: ['name cannot be blank']
			// });

			// return [];

			return this.schema.all('transaction');
		});

		this.post('/transactions', (schema, request) => {
			const data = JSON.parse(request.requestBody);

			return schema.create('transaction', data);
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
	const [isNewTransactionOpen, setIsNewTransactionOpen] = useState<boolean>(false);

	function handleOpenNewTransactionModal() {
		setIsNewTransactionOpen(true);
	}

	function handleCloseNewTransactionModal() {
		setIsNewTransactionOpen(false);
	}

	return (
		<QueryClientProvider client={queryClient}>
			<TransactionsProvider>
				<GlobalStyle />
				<Header onOpenNewTransactionModal={handleOpenNewTransactionModal} />
				<Dashboard />
				<NewTransactionModal
					isOpen={isNewTransactionOpen}
					onRequestClose={handleCloseNewTransactionModal} />
			</TransactionsProvider>
		</QueryClientProvider>
	);
}
