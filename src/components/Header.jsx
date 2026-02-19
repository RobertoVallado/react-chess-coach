export default function Header({ isLoggedIn, onToggleLogin, onSettings }) {
  return (
    <header className="flex items-center justify-between h-[46px] md:h-[52px] px-3 md:px-5 bg-header-bg border-b border-border-mid shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-[1.4rem] leading-none">♟</span>
        <span className="font-lato text-[0.82rem] md:text-[1rem] font-bold tracking-[0.08em] uppercase">
          Bob's Chess Coach
        </span>
      </div>

      <div className="flex items-center gap-2">
        {isLoggedIn && (
          <span className="font-lato text-[0.82rem] text-green tracking-[0.06em] px-[10px] py-[3px] border border-[#1e4a2a] rounded-full bg-green-bg">
            Uncle Bob
          </span>
        )}
        <button
          className="bg-btn-bg text-txt-primary border border-border-light rounded px-2 py-1 md:px-3 font-lato text-[0.75rem] md:text-[0.82rem] cursor-pointer hover:bg-btn-hover hover:text-blue transition-colors"
          onClick={onSettings}
          title="Settings"
        >
          ⚙
        </button>
        <button
          className="bg-btn-bg text-blue border border-blue-dim rounded px-2 py-1 md:px-3 font-lato text-[0.75rem] md:text-[0.82rem] cursor-pointer hover:bg-btn-hover transition-colors"
          onClick={onToggleLogin}
        >
          {isLoggedIn ? 'Log Off' : 'Log On'}
        </button>
      </div>
    </header>
  )
}
