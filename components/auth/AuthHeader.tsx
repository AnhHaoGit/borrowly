interface Props {
  title: string;
  description: string;
}

const AuthHeader = ({ title, description }: Props) => {
  return (
    <header className="text-center lg:text-left">
      <h1 className="text-3xl font-bold leading-tight text-primary sm:text-4xl">{title}</h1>
      <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">{description}</p>
    </header>
  );
};

export default AuthHeader;
