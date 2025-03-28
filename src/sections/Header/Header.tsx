interface HeaderProps {
  title?: string;
  children?: React.ReactNode;
}

function Header({ children }: HeaderProps) {
  return children;
}

export default Header;
