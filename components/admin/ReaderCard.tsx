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

//TODO: replace this
export default function ReaderCard({ reader }: { reader: Reader }) {
  const details = [
    { label: "Name", value: reader.name },
    { label: "Email", value: reader.email },
    { label: "Date of Birth", value: reader.dateOfBirth },
    { label: "Address", value: reader.address },
    { label: "Phone", value: reader.phone },
  ];

  return (
    <article className="flex flex-col items-start gap-4 rounded-xl border border-[#D9A9A3] p-4 shadow-sm sm:flex-row sm:items-center sm:gap-8 sm:px-8">
      <Image
        src={reader.avatarUrl}
        alt={`Avatar of ${reader.name}`}
        width={56}
        height={56}
        className="size-14 shrink-0 rounded-full bg-[#DCEFFF] object-cover"
      />

      <dl className="grid min-w-0 flex-1 gap-x-8 gap-y-2 text-[11px] sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)]">
        {details.map(({ label, value }) => (
          <div key={label} className="min-w-0">
            <dt className="font-semibold text-[#E0414F]">{label}</dt>
            <dd className="break-words text-[#222]">{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
