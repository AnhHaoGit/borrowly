const AnonymousAvatar = ({ className = "size-10" }: { className?: string }) => {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-primary text-accent ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-full">
        <circle cx="12" cy="9.2" r="4.2" />
        <path d="M3.5 23c.6-4.8 4-7.6 8.5-7.6s7.9 2.8 8.5 7.6z" />
      </svg>
    </span>
  );
};

export default AnonymousAvatar;
