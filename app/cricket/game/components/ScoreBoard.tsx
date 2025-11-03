import {
  CricketGameMode,
  CricketNumber,
  PlayerState,
  CRICKET_NUMBERS,
  getPlayerScore,
  calculateMPR,
} from "@/services/cricket";

interface ScoreBoardProps {
  players: PlayerState[];
  currentPlayerIndex: number;
  gameMode: CricketGameMode;
  gameFinished: boolean;
}

export function ScoreBoard({
  players,
  currentPlayerIndex,
  gameMode,
  gameFinished,
}: ScoreBoardProps) {
  // Check if all players have closed a specific number
  const isNumberClosedByAll = (num: CricketNumber) => {
    return players.every((p) => getPlayerScore(p, num).marks >= 3);
  };

  // Get mark symbol for display (Phoenix Dart style)
  const getMarkSymbol = (marks: number) => {
    if (marks === 0) return "";
    if (marks === 1) return "/";
    if (marks === 2) return "X";
    if (marks >= 3) return "⊗";
    return "";
  };

  // Split players into left and right columns
  const midPoint = Math.ceil(players.length / 2);
  const leftPlayers = players.slice(0, midPoint);
  const rightPlayers = players.slice(midPoint);

  const renderPlayerCell = (playerState: PlayerState | undefined, num: CricketNumber) => {
    if (!playerState) {
      return <td key="empty" className="p-2"></td>;
    }

    const score = getPlayerScore(playerState, num);
    const symbol = getMarkSymbol(score.marks);
    const isClosed = score.marks >= 3;
    const allClosed = isNumberClosedByAll(num);

    return (
      <td
        key={playerState.player.id}
        className={`p-2 text-center ${allClosed ? "bg-slate-800/30" : ""}`}
      >
        <div
          className={`text-2xl font-bold ${
            isClosed
              ? allClosed
                ? "text-slate-500"
                : "text-green-400"
              : score.marks > 0
              ? "text-cyan-400"
              : "text-slate-700"
          }`}
        >
          {symbol || "-"}
        </div>
      </td>
    );
  };

  return (
    <div className="bg-slate-900 rounded-xl shadow-2xl border-2 border-slate-700 h-full flex flex-col overflow-hidden">
      <div className="overflow-auto flex-1 relative">
        <table className="w-full border-collapse h-full">
          <thead className="sticky top-0 bg-slate-900 z-10">
            <tr className="border-b-2 border-cyan-500">
              {/* Left players headers */}
              {leftPlayers.map((playerState, idx) => {
                const isCurrentPlayer = players.indexOf(playerState) === currentPlayerIndex;
                return (
                  <th
                    key={playerState.player.id}
                    className={`p-2 text-center font-bold text-base min-w-[70px] ${
                      isCurrentPlayer && !gameFinished
                        ? "text-cyan-400 border-b-4 border-cyan-400"
                        : "text-white"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-sm">{playerState.player.name}</span>
                      {isCurrentPlayer && !gameFinished && (
                        <span className="text-cyan-400 text-xs">▼</span>
                      )}
                    </div>
                  </th>
                );
              })}
              {/* Number column header */}
              <th className="p-2 text-center font-bold text-white text-base min-w-[60px] border-x-2 border-slate-700">

              </th>
              {/* Right players headers */}
              {rightPlayers.map((playerState, idx) => {
                const isCurrentPlayer = players.indexOf(playerState) === currentPlayerIndex;
                return (
                  <th
                    key={playerState.player.id}
                    className={`p-2 text-center font-bold text-base min-w-[70px] ${
                      isCurrentPlayer && !gameFinished
                        ? "text-cyan-400 border-b-4 border-cyan-400"
                        : "text-white"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-sm">{playerState.player.name}</span>
                      {isCurrentPlayer && !gameFinished && (
                        <span className="text-cyan-400 text-xs">▼</span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {CRICKET_NUMBERS.map((num) => {
              const allClosed = isNumberClosedByAll(num);
              return (
                <tr
                  key={num}
                  className={`border-b border-slate-700 ${
                    allClosed ? "bg-slate-800/50" : ""
                  }`}
                >
                  {/* Left players */}
                  {leftPlayers.map((playerState) => renderPlayerCell(playerState, num))}
                  {/* Number column */}
                  <td
                    className={`p-2 text-center font-bold text-xl border-x-2 border-slate-700 ${
                      allClosed ? "text-slate-500" : "text-white"
                    }`}
                  >
                    {num === 25 ? "Bull" : num}
                  </td>
                  {/* Right players */}
                  {rightPlayers.map((playerState) => renderPlayerCell(playerState, num))}
                </tr>
              );
            })}
          </tbody>
          <tfoot className="sticky bottom-0 bg-slate-900 z-10">
            {/* Total Points Row */}
            <tr className="border-t-2 border-cyan-500 bg-slate-800">
              {leftPlayers.map((playerState) => (
                <td
                  key={playerState.player.id}
                  className={`p-2 text-center font-bold text-lg ${
                    gameMode === CricketGameMode.CutThroat
                      ? "text-red-400"
                      : "text-white"
                  }`}
                >
                  {playerState.totalPoints}
                </td>
              ))}
              <td className="p-2 text-center font-bold text-white text-sm border-x-2 border-slate-700">
                Points
              </td>
              {rightPlayers.map((playerState) => (
                <td
                  key={playerState.player.id}
                  className={`p-2 text-center font-bold text-lg ${
                    gameMode === CricketGameMode.CutThroat
                      ? "text-red-400"
                      : "text-white"
                  }`}
                >
                  {playerState.totalPoints}
                </td>
              ))}
            </tr>
            {/* MPR Row */}
            <tr className="bg-slate-800">
              {leftPlayers.map((playerState) => (
                <td
                  key={playerState.player.id}
                  className="p-2 text-center font-bold text-base text-cyan-400"
                >
                  {calculateMPR(playerState).toFixed(2)}
                </td>
              ))}
              <td className="p-2 text-center font-bold text-white text-sm border-x-2 border-slate-700">
                MPR
              </td>
              {rightPlayers.map((playerState) => (
                <td
                  key={playerState.player.id}
                  className="p-2 text-center font-bold text-base text-cyan-400"
                >
                  {calculateMPR(playerState).toFixed(2)}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
