import { LuCalendarDays, LuMail } from "react-icons/lu";
import AnonymousAvatar from "@/components/ui/AnonymousAvatar";

interface Props {
  user: {
    fullName: string;
    email: string;
    createdAt: Date | string;
  };
}

const formatMemberSince = (value: Date | string) => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

const ProfileCard = ({ user }: Props) => (
  <aside
    aria-label="Profile information"
    className="rounded-2xl border border-accent bg-surface p-5 shadow-soft lg:sticky lg:top-24"
  >
    <div className="flex items-center gap-4 lg:flex-col lg:gap-3 lg:text-center">
      {/* Cùng avatar với navbar: chưa có ảnh người dùng nên dùng hình mặc định */}
      <AnonymousAvatar className="size-16 shrink-0 sm:size-20" />

      <div className="min-w-0">
        <h2 className="break-words text-xl font-bold leading-tight text-primary">
          {user.fullName}
        </h2>
        <p className="mt-1 break-all text-sm text-muted">{user.email}</p>
      </div>
    </div>

    <dl className="mt-5 space-y-3 border-t border-accent/70 pt-4">
      <div className="flex items-start justify-between gap-3">
        <dt className="flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary">
          <LuCalendarDays className="size-3.5" />
          Member since
        </dt>
        <dd className="text-right text-sm text-primary">
          {formatMemberSince(user.createdAt)}
        </dd>
      </div>
    </dl>

    <p className="mt-4 flex items-center gap-2 rounded-xl bg-background/70 px-3 py-2 text-xs text-muted">
      <LuMail className="size-3.5 shrink-0" />
      Contact the desk if your details look wrong.
    </p>
  </aside>
);

export default ProfileCard;
