import styled from "@emotion/styled";

const Tabs = styled.ul`
  list-style: none;
  margin: 0.75rem 0.5rem 0 0;

  > li {
    display: inline-block;
    margin-right: 1rem;
    a {
      color: ${(props) => props.theme.colors.text};
      text-decoration: none;
      padding: 0 0.5rem calc(0.75rem - 4px) 0;
      display: block;
      font-size: 1.2rem;
      transition: 0.1s border-bottom;

      &.active {
        border-bottom: 4px solid ${(props) => props.theme.colors.primary};
        margin-bottom: -2px;
      }

      &:hover {
        border-bottom: 4px solid ${(props) => props.theme.colors.primary};
        margin-bottom: -2px;
      }

      @media (prefers-color-scheme: dark) {
        color: ${(props) => props.theme.colors.textDark};
      }
    }
  }
`;

export default Tabs;
