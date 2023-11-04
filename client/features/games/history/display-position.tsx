export const displayPosition = (position: number) => {
  switch (position) {
    case 1:
      return <div className="text-2xl">🥇</div>;
    case 2:
      return <div className="text-2xl">🥈</div>;
    case 3:
      return <div className="text-2xl">🥉</div>;
    default:
      return position;
  }
};
