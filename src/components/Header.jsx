import '../styles/Header.css'

export default function Header({ isLoggedIn, onToggleLogin, onSettings }) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <span className="header-logo">♟</span>
        <span className="header-title">Bob's Chess Coach</span>
      </div>

      <div className="header-user">
        {isLoggedIn && (
          <span className="header-username">Uncle Bob</span>
        )}
        <button className="header-btn" onClick={onSettings} title="Settings">
          ⚙
        </button>
        <button className="header-btn login-btn" onClick={onToggleLogin}>
          {isLoggedIn ? 'Log Off' : 'Log On'}
        </button>
      </div>
    </header>
  )
}
