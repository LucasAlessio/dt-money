import { Container } from "./styles";
import { useTransactions } from "../../hooks/useTransactions";

import incomeImg from '../../assets/income.svg';
import outcomeImg from '../../assets/outcome.svg';
import totalImg from '../../assets/total.svg';

export function Summary() {
	const { result: { data, isLoading, error } } = useTransactions();

	const summary = data?.transactions.reduce((acc, value) => {
		if (value.type === 'deposit') {
			acc.deposits += value.amount;
			acc.total += value.amount;
		} else {
			acc.withdraws += value.amount;
			acc.total -= value.amount;
		}

		return acc;
	}, { deposits: 0, withdraws: 0, total: 0 })

	return (
		<Container>
			<div>
				<header>
					<p>Entradas</p>
					<img src={ incomeImg } alt="Entradas" />
				</header>
				{ isLoading ? (
					<span>Carregando...</span>
				) : (
					!error && <strong>
						{ Intl.NumberFormat('pt-BR', {
							style: 'currency',
							currency: 'BRL',
						}).format(summary?.deposits || 0) }
					</strong>
				) }
			</div>

			<div>
				<header>
					<p>Saídas</p>
					<img src={ outcomeImg } alt="Saídas" /> 
				</header>
				{ isLoading ? (
					<span>Carregando...</span>
				) : (
					!error && <strong>
						- { Intl.NumberFormat('pt-BR', {
							style: 'currency',
							currency: 'BRL',
						}).format(summary?.withdraws || 0) }
					</strong>
				) }
			</div>

			<div className="highlight-background">
				<header>
					<p>Total</p>
					<img src={ totalImg } alt="Total" /> 
				</header>
				{ isLoading ? (
					<span>Carregando...</span>
				) : (
					!error && <strong>
						{ Intl.NumberFormat('pt-BR', {
							style: 'currency',
							currency: 'BRL',
						}).format(summary?.total || 0) }
					</strong>
				) }
			</div>
		</Container>
	);
}
