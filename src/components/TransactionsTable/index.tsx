import { useTransactions } from "../../hooks/useTransactions";
import { Container } from "./styles";

export function TransactionsTable() {
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
							<tr key={ transaction.id } role="button">
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
									<td colSpan={4}>Buscando informações...</td>
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
