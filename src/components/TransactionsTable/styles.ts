import styled from "styled-components";

export const Container = styled.div`
	margin-top: 4rem;

	table {
		width: 100%; 
		border-spacing: 0 0.5rem;

		th {
			color: var(--text-body);
			font-weight: 400;
			padding: 1rem 2rem;
			text-align: left;
			line-height: 1.5rem;
		}

		td {
			padding: 1rem 2rem;
			border: 0;
			background: var(--shape);
			color: var(--text-body);
			cursor: pointer;
			user-select: none;

			&:first-child {
				border-top-left-radius: 0.25rem;
				border-bottom-left-radius: 0.25rem;
				color: var(--text-title);
			}

			&:last-child {
				border-top-right-radius: 0.25rem;
				border-bottom-right-radius: 0.25rem;
			}

			&.deposit {
				color: var(--green);
			}

			&.withdraw {
				color: var(--red);
			}
		}

		tbody tr {
			border-radius: 0.25rem;
			
			transition: box-shadow 0.2s;

			&:not(.line-muted):hover {
				box-shadow: 0 1px 6px 0 rgba(32, 33, 36, .28);
			}

			&.line-muted td {
				text-align: center;
				color: var(--text-body);
				cursor: default;
			}

			&.loading td, &.error td {
				background-color: rgba(255, 255, 255, .3);
			}
		}
	}
`;
