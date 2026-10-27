import Image from "next/image";
import { type Reader } from "@/types/reader"
import { formatDate } from "@/lib/date";

interface Props {
  reader: Reader;
}

const ReaderCard = ({ reader }: Props) => {
  type Info = {
    label: string,
    value: string | null
  };
  
  const details: Info[] = [
    { label: "Name", value: reader.fullName },
    { label: "Email", value: reader.email },
    { label: "Last Active", value: reader.lastActivityDate},
    { label: "Created At", value: formatDate(reader.createdAt)}
  ];

  return (
    <article className="flex flex-col items-start gap-4 rounded-2xl border border-accent-deep/40 bg-surface p-4 shadow-soft sm:flex-row sm:items-center sm:gap-8 sm:px-6">
      <Image
        //TODO: replace image placeholder
        src={"/Avatar.png"}
        alt={`Avatar of ${reader.fullName}`}
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
            <dd className="break-words text-sm text-primary">{value? value:"None"}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
};

export default ReaderCard;
