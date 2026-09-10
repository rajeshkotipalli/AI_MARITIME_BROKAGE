import {
  Link,
  useLocation,
} from "react-router-dom";

function Navbar({
  user,
  onLogout,
}) {
  const location = useLocation();

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const navItems = [
    {
      path: "/",
      label: "Home",
    },
    {
      path: "/routes",
      label: "Plot Route",
    },
    {
      path: "/history",
      label: "History",
    },
    {
      path: "/connected-ports",
      label: "Connected Ports",
    },
    {
      path: "/weather",
      label: "Weather",
    },
    {
      path: "/dashboard",
      label: "Dashboard",
    },
  ];

  // ==========================================================
  // ACTIVE PAGE
  // ==========================================================

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname === path;
  };

  // ==========================================================
  // USER
  // ==========================================================

  const userName =
    user?.name ||
    user?.username ||
    "User";

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <header className="wp-nav">

      {/* ======================================================
          BRAND
          ====================================================== */}

      <Link
        to="/"
        className="wp-nav__brand"
      >

        <div
          className="wp-nav__mark"
          aria-hidden="true"
        >
          W
        </div>

        <span>
          WAYPOINT
        </span>

      </Link>

      {/* ======================================================
          NAVIGATION
          ====================================================== */}

      <nav className="wp-nav__links">

        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={
              isActive(item.path)
                ? "active"
                : ""
            }
          >
            {item.label}
          </Link>
        ))}

      </nav>

      {/* ======================================================
          RIGHT SIDE
          ====================================================== */}

      <div className="wp-nav__right">

        {/* SYSTEM STATUS */}

        <span className="wp-dot wp-dot--on" />

        <span className="wp-online-text">
          SYSTEM ONLINE
        </span>

        {/* USER */}

        {user && (
          <span className="wp-nav__user">
            {userName}
          </span>
        )}

        {/* LOGOUT */}

        {user && (
          <button
            type="button"
            className="wp-logout"
            onClick={() => {
              if (
                typeof onLogout ===
                "function"
              ) {
                onLogout();
              }
            }}
          >
            Logout
          </button>
        )}

      </div>

    </header>
  );
}

export default Navbar;