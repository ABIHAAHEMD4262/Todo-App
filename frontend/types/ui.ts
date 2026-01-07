// UI Component Types

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface ScrollAreaProps extends React.ComponentPropsWithoutRef<typeof import('@radix-ui/react-scroll-area').Root> {}

export interface ScrollBarProps extends React.ComponentPropsWithoutRef<typeof import('@radix-ui/react-scroll-area').Scrollbar> {}