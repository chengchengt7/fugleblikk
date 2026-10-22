function formatDate(iso: string) {
  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Oslo",
  }).format(new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso));
}

export default function HeroMessage({
  totalSpecies,
  period,
}: {
  totalSpecies: number;
  period: { from: string; to: string };
}) {
  return (
    <div className="hero-message">
      <h5>{totalSpecies} observerte fuglearter</h5>
      <p>
        {formatDate(period.from)}-{formatDate(period.to)}.
      </p>
    </div>
  );
}
