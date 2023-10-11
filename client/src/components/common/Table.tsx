import styled from "@emotion/styled";
import { colorShade } from "utils/theme";

export const Table = styled.table`
  width: 100%;
  border: none;
  border-collapse: collapse;

  & tbody tr {
    transition: 0.25s background-color;
    &:nth-of-type(odd) {
      background-color: var(--mi-lighten-background-color);

      @media (prefers-color-scheme: dark) {
        background-color: var(--mi-darken-background-color);
      }
    }
    &:hover {
      background-color: ${(props) =>
        colorShade(props.theme.colors.background, -40)} !important;

      @media (prefers-color-scheme: dark) {
        background-color: ${(props) =>
          colorShade(props.theme.colors.backgroundDark, -40)} !important;
      }
    }
  }

  & th {
    text-align: left;
    background-color: var(--mi-shade-background-color);
  }
  & td,
  & th {
    padding: 0.5rem 1rem;
  }
  & td.alignRight,
  & th.alignRight {
    text-align: right;
  }

  @media screen and (max-width: 800px) {
    & td,
    &th {
      padding: 0.25rem 0.5rem;
    }
  }
`;

export default Table;
