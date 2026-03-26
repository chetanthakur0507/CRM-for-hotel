"use client";

interface StatusNoticeProps {
  loading: boolean;
  notice: string;
}

export default function StatusNotice({ loading, notice }: StatusNoticeProps) {
  return (
    <section className="panel">
      <strong>Status:</strong> {loading ? " Sync in progress..." : ` ${notice}`}
    </section>
  );
}
