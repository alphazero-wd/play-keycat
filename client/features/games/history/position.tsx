export const Position = ({ position }: { position: number }) => {
  switch (position) {
    case 1:
      return <div className="text-2xl">🥇</div>;
    case 2:
      return <div className="text-2xl">🥈</div>;
    case 3:
      return <div className="text-2xl">🥉</div>;
    default:
      const suffixes = { one: "st", two: "nd", few: "rd", other: "th" };
      const englishOrdinalRules = new Intl.PluralRules("en", {
        type: "ordinal",
      });
      const category = englishOrdinalRules.select(
        position,
      ) as keyof typeof suffixes;
      const suffix = suffixes[category];
      return position + suffix;
  }
};
