import { darken, lighten } from "polished";
import curriedTransparentize from "polished/lib/color/transparentize";
import styled from "styled-components";

export const Container = styled.div`
	h2 {
		color: var(--text-title);
		font-size: 1.5rem;
		margin-bottom: 2rem;
	}

	p {
		color: var(--text-body);
	}

	input {
		width: 100%;
		padding: 0 1.5rem;
		height: 4rem;
		border-radius: 0.25rem;

		border: 1px solid #d7d7d7;
		background: #e7e9ee;

		font-weight: 400;
		font-size: 1rem;

		&.has-error {
			box-shadow: 0 0px 2px 2px ${lighten(0.2, "#e52e4d")};
		}

		&::placeholder {
			color: var(--text-body);
		}

		& + input {
			margin-top: 1rem;
		}
	}

	button[type="submit"] {
		width: 100%;
		height: 4rem;
		padding: 0 1.5rem;
		background: var(--green);
		color: var(--shape);
		border-radius: 0.25rem;
		border: 0;
		font-size: 1rem;
		margin-top: 1.5rem;
		font-weight: 600;

		transition: filter 0.2s;

		&:hover {
			filter: brightness(0.9);
		}
	}

	.error {
		display: block;
		margin-bottom: 1rem;

		color: var(--red);

		font-size: 0.875rem;
	}

	hr {
		border: 0;
		border-top: 1px solid #d7d7d7;
		margin: 2rem 0;
	}

	button.btn-danger {
		width: 100%;
		height: 4rem;
		padding: 0 1.5rem;
		background: ${ lighten(0.1, '#e52e4d') };
		color: var(--shape);
		border-radius: 0.25rem;
		border: 0;
		font-size: 1rem;
		font-weight: 600;

		transition: filter 0.2s;

		&:hover {
			filter: brightness(0.9);
		}
	}
`;

export const TransactionTypeContainer = styled.div`
	margin: 1rem 0;
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 0.5rem;

	& + .error {
		margin-top: -1rem;
	}
`;

const colors = {
	green: '#33cc95',
	red: '#e52e4d',
}

type RadioBoxProps = {
	isActive: boolean,
	activeColor: keyof typeof colors,
}

export const RadioBox = styled.button<RadioBoxProps>`
	height: 4rem;
	border: 1px solid #d7d7d7;
	border-radius: 0.25rem;

	background: ${({ isActive, activeColor }) => isActive ? curriedTransparentize(0.9, colors[activeColor]) : 'transparent'};

	display: flex;
	align-items: center;
	justify-content: center;

	transition: border-color 0.2s;

	&.has-error {
		box-shadow: 0 0px 2px 2px ${lighten(0.2, "#e52e4d")};
	}

	&:hover {
		border-color: ${darken(0.1, '#d7d7d7')};
	}

	img {
		width: 20px;
		height: 20px;
	}

	span {
		display: inline-block;
		margin-left: 1rem;
		font-size: 1rem;
		color: var(--text-title);
	}
`;
