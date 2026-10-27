import Image from "next/image";

export type Reader = {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  phone: string;
  address: string;
  avatarUrl: string;
};

interface Props {
  reader: Reader;
}

const ReaderCard = ({ reader }: Props) => {
  const details = [
    { label: "Name", value: reader.name },
    { label: "Email", value: reader.email },
    { label: "Date of birth", value: reader.dateOfBirth },
    { label: "Address", value: reader.address },
    { label: "Phone", value: reader.phone },
  ];

  return (
    <article className="flex flex-col items-start gap-4 rounded-2xl border border-accent-deep/40 bg-surface p-4 shadow-soft sm:flex-row sm:items-center sm:gap-8 sm:px-6">
      <Image
        src={reader.avatarUrl}
        alt={`Avatar of ${reader.name}`}
        width={64}
        height={64}
        className="size-16 shrink-0 rounded-full border-2 border-accent-deep bg-accent object-cover"
      />

      <dl className="grid min-w-0 flex-1 gap-x-8 gap-y-3 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)]">
        {details.map(({ label, value }) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              {label}
            </dt>
            <dd className="break-words text-sm text-primary">{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
};

export default ReaderCard;
