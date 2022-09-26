import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTransactions } from "../../hooks/useTransactions";
import { Container } from "./styles";

type TransactionsTableProps = {
	onOpenUpdateTransactionModal: (transactionId: number) => void,
}

export function TransactionsTable({ onOpenUpdateTransactionModal }: TransactionsTableProps) {
	const { result: { data, isFetching, error } } = useTransactions();

	return (
		<Container>
			<table>
				<thead>
					<tr>
						<th>Título</th>
						<th>Valor</th>
						<th>Categoria</th>
						<th>Data</th>
					</tr>
				</thead>

				<tbody>
					{ (data?.transactions || []).length > 0 ? (
						data?.transactions.map(transaction => (
							<tr key={ transaction.id } role="button" onClick={ () => onOpenUpdateTransactionModal(transaction.id) }>
								<td>{ transaction.title }</td>
								<td className={ transaction.type }>
									{ transaction.type === 'withdraw' ? '-' : ''}
									{ new Intl.NumberFormat('pt-BR', {
										style: 'currency',
										currency: 'BRL',
									}).format(Number(transaction.amount)) }
								</td>
								<td>{ transaction.category }</td>
								<td>
									{ new Intl.DateTimeFormat('pt-BR').format(new Date(transaction.createdAt)) }
								</td>
							</tr>
						))
					) : (
						<>
							{ isFetching && (
								<tr className="line-muted loading">
									<td colSpan={4}><FontAwesomeIcon icon={faSpinner} pulse /> Buscando informações</td>
								</tr>
							) }
							{ error && (
								<tr className="line-muted error">
									<td colSpan={4}>{ error.message }</td>
								</tr>
							) }
							{ !isFetching && !error && (data?.transactions || []).length === 0 && (
								<tr className="line-muted">
									<td colSpan={4}>Nenhuma movimentação financeira encontrada.</td>
								</tr>
							) }
						</>
					) }
				</tbody>
			</table>
		</Container>
	);
}
