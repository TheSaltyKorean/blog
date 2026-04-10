export interface NavItem {
  text: string;
  url: string;
}

export const mainMenu: NavItem[] = [
  { text: 'Home', url: '/' },
  { text: 'About', url: '/about/' },
  { text: 'Contact', url: '/contact/' },
];
