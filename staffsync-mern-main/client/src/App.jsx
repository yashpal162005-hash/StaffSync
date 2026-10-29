import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api from "./api.js";
import { logout, setAuth, setUser } from "./store.js";

function Protected({ children }) {
  const user = useSelector((s) => s.auth.user);
  return user ? children : <Navigate to="/login" replace />;
}

function Layout({ children }) {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const links = [
    ["Dashboard", "/"],
    ["Attendance", "/attendance"],
    ["Leaves", "/leaves"],
    ["Announcements", "/announcements"],
    ["Training", "/trainings"],
    ...(user?.role !== "employee" ? [["Employees", "/employees"]] : [])
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">S</span>
          <span>Staff<span className="brand-light">Sync</span></span>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          {links.map(([label, path]) => (
            <NavLink
              end={path === "/"}
              key={path}
              to={path}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <span className="nav-dot"></span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="avatar">{user?.name?.[0]?.toUpperCase() || "U"}</div>
          <div className="user-mini">
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>
          <button
            className="logout"
            title="Log out"
            onClick={() => {
              dispatch(logout());
              navigate("/login");
            }}
          >
            ↗
          </button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div>
            <span className="topbar-eyebrow">PEOPLE OPERATIONS</span>
            <h6>Human Resource Management</h6>
          </div>
          <div className="topbar-right">
            <span className="status-dot"></span>
            <span>Workspace active</span>
            <div className="top-avatar">{user?.name?.[0]?.toUpperCase() || "U"}</div>
          </div>
        </header>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}

function AuthPage({ mode }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", department: "Engineering" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data } = await api.post(`/auth/${mode}`, form);
      dispatch(setAuth(data));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Could not connect to StaffSync API");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="brand brand-white">
          <span className="brand-mark">S</span>
          <span>Staff<span className="brand-light">Sync</span></span>
        </div>
        <div className="hero-copy">
          <div className="eyebrow-pill">✦ &nbsp; PEOPLE FIRST, ALWAYS</div>
          <h1>
            Great teams<br />start with <em>great<br />people.</em>
          </h1>
          <p>One connected workspace for your people, processes, and progress.</p>
          <div className="hero-stat">
            <div className="stat-avatars">
              <span>J</span><span>A</span><span>M</span><span>+</span>
            </div>
            <div>
              <strong>One team. One place.</strong>
              <small>Everything HR, in sync.</small>
            </div>
          </div>
        </div>
        <div className="visual-footer">STAFFSYNC · PEOPLE OPERATIONS PLATFORM</div>
      </div>
      <div className="auth-form-wrap">
        <div className="auth-form">
          <div className="form-kicker">WELCOME {mode === "login" ? "BACK" : "ABOARD"}</div>
          <h2>{mode === "login" ? "Sign in to your workspace" : "Create your account"}</h2>
          <p className="muted">Your people platform, all in one place.</p>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form onSubmit={submit}>
            {mode === "register" && (
              <>
                <label>Full name</label>
                <input
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={change}
                  required
                  placeholder="e.g. Aanya Sharma"
                />
                <label>Department</label>
                <select className="form-select" name="department" value={form.department} onChange={change}>
                  <option>Engineering</option>
                  <option>Human Resources</option>
                  <option>Marketing</option>
                  <option>Finance</option>
                  <option>Operations</option>
                  <option>Sales</option>
                </select>
              </>
            )}
            <label>Work email</label>
            <input
              className="form-control"
              type="email"
              name="email"
              value={form.email}
              onChange={change}
              required
              placeholder="you@company.com"
            />
            <label>Password</label>
            <input
              className="form-control"
              type="password"
              name="password"
              value={form.password}
              onChange={change}
              required
              minLength={8}
              placeholder="At least 8 characters"
            />
            <button className="btn btn-primary w-100 auth-submit" disabled={busy}>
              {busy ? "Please wait…" : mode === "login" ? "Sign in →" : "Create account →"}
            </button>
          </form>

          {mode === "login" && (
            <div className="demo-credentials">
              <h4>Demo Credentials</h4>
              <p>Use these accounts to explore StaffSync.</p>

              <div className="demo-account">
                <strong>HR</strong>
                <div>Email: hr@staffsync.com</div>
                <div>Password: password123</div>
              </div>

              <div className="demo-account">
                <strong>Manager</strong>
                <div>Email: manager@staffsync.com</div>
                <div>Password: password123</div>
              </div>

              <div className="demo-account">
                <strong>Employee</strong>
                <div>Email: employee@staffsync.com</div>
                <div>Password: password123</div>
              </div>
            </div>
          )}

          <p className="switch-auth">
            {mode === "login" ? "New to StaffSync?" : "Already have an account?"}{" "}
            <button onClick={() => navigate(mode === "login" ? "/register" : "/login")}>
              {mode === "login" ? "Create account" : "Sign in"}
            </button>
          </p>
          <div className="security-note">⌁ &nbsp; Secure sign-in · Role-based access</div>
        </div>
      </div>
    </div>
  );
}

function PageHeading({ kicker, title, subtitle, action }) {
  return (
    <div className="page-heading">
      <div>
        <div className="section-kicker">{kicker}</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function Dashboard() {
  const user = useSelector((s) => s.auth.user);
  const [counts, setCounts] = useState({ leaves: [], announcements: [], trainings: [], employees: [], attendance: [] });
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/leaves"),
      api.get("/announcements"),
      api.get("/trainings"),
      user.role !== "employee" ? api.get("/employees") : Promise.resolve({ data: [] }),
      api.get("/attendance")
    ])
      .then(([l, a, t, e, at]) =>
        setCounts({ leaves: l.data, announcements: a.data, trainings: t.data, employees: e.data, attendance: at.data })
      )
      .catch((err) => setError(err.response?.data?.message || "Unable to load dashboard data"));
  }, [user.role]);

  const pending = counts.leaves.filter((x) => x.status === "pending").length;
  const stats =
    user.role === "employee"
      ? [
        ["My leave requests", counts.leaves.length, "Requests submitted", "violet"],
        ["Pending approvals", pending, "Awaiting a decision", "amber"],
        ["Attendance records", counts.attendance.length, "Your recorded days", "green"],
        ["Training programs", counts.trainings.length, "Available to explore", "blue"]
      ]
      : [
        ["Team members", counts.employees.length, "People in directory", "violet"],
        ["Pending leaves", pending, "Need review", "amber"],
        ["Attendance records", counts.attendance.length, "Recent records", "green"],
        ["Announcements", counts.announcements.length, "Published updates", "blue"]
      ];

  return (
    <>
      <PageHeading
        kicker={`${user?.role?.toUpperCase() || "USER"} OVERVIEW`}
        title={`Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"
          }, ${user?.name ? user.name.split(" ")[0] : "there"}.`}
        subtitle="Here's what's happening across your workspace today."
        action={
          <span className="date-chip">
            ◷ &nbsp; {new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
          </span>
        }
      />
      {error && <div className="alert alert-warning">{error}</div>}
      <div className="stats-grid">
        {stats.map(([label, value, desc, color]) => (
          <div className="stat-card" key={label}>
            <div className="stat-top">
              <span>{label}</span>
              <span className={`stat-icon ${color}`}>◈</span>
            </div>
            <div className="stat-number">{value}</div>
            <div className="stat-desc">{desc}</div>
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Recent leave requests</h3>
              <p>Latest leave activity</p>
            </div>
            <NavLink to="/leaves">View all →</NavLink>
          </div>
          {counts.leaves.slice(0, 5).length ? (
            counts.leaves.slice(0, 5).map((l) => (
              <div className="list-row" key={l._id}>
                <div className="list-avatar">{(l.user?.name || user?.name || "U")[0]}</div>
                <div className="list-main">
                  <strong>{l.user?.name || "You"}</strong>
                  <span>{l.leaveType} · {l.startDate} to {l.endDate}</span>
                </div>
                <Status value={l.status} />
              </div>
            ))
          ) : (
            <Empty text="No leave requests yet." />
          )}
        </section>
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Company announcements</h3>
              <p>Latest news and updates</p>
            </div>
            <NavLink to="/announcements">View all →</NavLink>
          </div>
          {counts.announcements.slice(0, 4).length ? (
            counts.announcements.slice(0, 4).map((a) => (
              <div className="announcement-mini" key={a._id}>
                <div className="announcement-mark">✦</div>
                <div>
                  <strong>{a.title}</strong>
                  <p>{a.body}</p>
                  <small>{a.author?.name || "StaffSync"} · {new Date(a.createdAt).toLocaleDateString()}</small>
                </div>
              </div>
            ))
          ) : (
            <Empty text="No announcements posted yet." />
          )}
        </section>
      </div>
      <section className="panel quick-panel">
        <div>
          <h3>Make your next move</h3>
          <p>Keep your workday moving with quick actions.</p>
        </div>
        <div className="quick-actions">
          <NavLink to="/attendance" className="quick-action">
            <span>◷</span>
            <strong>Attendance</strong>
            <small>Check in or out</small>
          </NavLink>
          <NavLink to="/leaves" className="quick-action">
            <span>▤</span>
            <strong>Request leave</strong>
            <small>Plan time away</small>
          </NavLink>
          <NavLink to="/trainings" className="quick-action">
            <span>↗</span>
            <strong>Learning</strong>
            <small>Explore training</small>
          </NavLink>
        </div>
      </section>
    </>
  );
}

function Status({ value }) {
  return <span className={`status-badge ${value}`}>{value}</span>;
}

function Empty({ text }) {
  return (
    <div className="empty-state">
      <div>◇</div>
      {text}
    </div>
  );
}

function AttendancePage() {
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const { data } = await api.get("/attendance");
      setRows(data);
    } catch (e) {
      setError(e.response?.data?.message || "Could not load attendance");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function act(type) {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await api.post(`/attendance/${type}`);
      setMessage(type === "check-in" ? "Checked in successfully." : "Checked out successfully.");
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Action failed");
    } finally {
      setBusy(false);
    }
  }

  const today = rows.find((r) => r.date === new Date().toISOString().slice(0, 10));

  return (
    <>
      <PageHeading kicker="TIME & ATTENDANCE" title="Attendance" subtitle="Keep track of your workday and attendance history." />
      <div className="attendance-hero">
        <div>
          <div className="section-kicker light-kicker">TODAY'S ATTENDANCE</div>
          <h2>{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</h2>
          <p>
            {today?.checkIn
              ? `Checked in at ${new Date(today.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : "You haven't checked in yet today."}
          </p>
        </div>
        <div className="attendance-buttons">
          <button disabled={busy || !!today?.checkIn} onClick={() => act("check-in")} className="btn btn-light">
            ↘ Check in
          </button>
          <button
            disabled={busy || !today?.checkIn || !!today?.checkOut}
            onClick={() => act("check-out")}
            className="btn btn-outline-light"
          >
            ↗ Check out
          </button>
        </div>
      </div>
      {message && <div className="alert alert-success mt-3">{message}</div>}
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      <section className="panel mt-4">
        <div className="panel-head">
          <div>
            <h3>Attendance history</h3>
            <p>Your most recent records</p>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check in</th>
                <th>Check out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id}>
                  <td>{r.date}</td>
                  <td>{r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                  <td>{r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                  <td><Status value={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <Empty text="No attendance records yet. Check in to start your history." />}
        </div>
      </section>
    </>
  );
}

function LeavesPage() {
  const user = useSelector((s) => s.auth.user);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ leaveType: "Casual", startDate: "", endDate: "", reason: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await api.get("/leaves");
    setRows(data);
  }

  useEffect(() => {
    load().catch((e) => setError(e.response?.data?.message || "Could not load leaves"));
  }, []);

  async function create(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.post("/leaves", form);
      setMessage("Leave request submitted.");
      setForm({ leaveType: "Casual", startDate: "", endDate: "", reason: "" });
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not submit request");
    } finally {
      setBusy(false);
    }
  }

  async function review(id, status) {
    setError("");
    try {
      await api.patch(`/leaves/${id}/status`, { status });
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Review failed");
    }
  }

  return (
    <>
      <PageHeading kicker="TIME OFF" title="Leave management" subtitle="Submit requests and follow every decision in one place." />
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}
      {user?.role === "employee" && (
        <section className="panel form-panel">
          <div className="panel-head">
            <div>
              <h3>Request time off</h3>
              <p>Complete the details below to submit a leave request.</p>
            </div>
          </div>
          <form onSubmit={create} className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Leave type</label>
              <select className="form-select" value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })}>
                <option>Casual</option>
                <option>Sick</option>
                <option>Annual</option>
                <option>Other</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Start date</label>
              <input
                className="form-control"
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">End date</label>
              <input
                className="form-control"
                type="date"
                min={form.startDate}
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
            <div className="col-md-12">
              <label className="form-label">Reason</label>
              <textarea
                className="form-control"
                rows="3"
                required
                maxLength="1000"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Briefly explain your request…"
              />
            </div>
            <div className="col-12">
              <button className="btn btn-primary" disabled={busy}>
                {busy ? "Submitting…" : "Submit request →"}
              </button>
            </div>
          </form>
        </section>
      )}
      <section className="panel mt-4">
        <div className="panel-head">
          <div>
            <h3>{user?.role === "employee" ? "My requests" : "Leave requests"}</h3>
            <p>{user?.role === "employee" ? "Track the status of your submitted requests." : "Review requests from your team."}</p>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                {user?.role !== "employee" && <th>Employee</th>}
                <th>Type</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Status</th>
                {user?.role !== "employee" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id}>
                  {user?.role !== "employee" && (
                    <td>
                      <strong>{r.user?.name}</strong>
                      <div className="small text-secondary">{r.user?.department}</div>
                    </td>
                  )}
                  <td>{r.leaveType}</td>
                  <td>
                    {r.startDate}
                    <div className="small text-secondary">to {r.endDate}</div>
                  </td>
                  <td className="reason-cell">{r.reason}</td>
                  <td><Status value={r.status} /></td>
                  {user?.role !== "employee" && (
                    <td>
                      {r.status === "pending" ? (
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-success" onClick={() => review(r._id, "approved")}>
                            Approve
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => review(r._id, "rejected")}>
                            Reject
                          </button>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <Empty text="No leave requests found." />}
        </div>
      </section>
    </>
  );
}

function AnnouncementsPage() {
  const user = useSelector((s) => s.auth.user);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ title: "", body: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const { data } = await api.get("/announcements");
    setRows(data);
  }

  useEffect(() => {
    load().catch((e) => setError(e.response?.data?.message || "Could not load announcements"));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post("/announcements", form);
      setForm({ title: "", body: "" });
      setMessage("Announcement published.");
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not publish announcement");
    }
  }

  return (
    <>
      <PageHeading kicker="COMPANY UPDATES" title="Announcements" subtitle="The latest news, notices, and updates from your organization." />
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}
      {user?.role === "hr" && (
        <section className="panel form-panel mb-4">
          <div className="panel-head">
            <div>
              <h3>Publish announcement</h3>
              <p>Share an update with everyone in the workspace.</p>
            </div>
          </div>
          <form onSubmit={submit}>
            <label className="form-label">Title</label>
            <input
              className="form-control mb-3"
              required
              maxLength="160"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Announcement headline"
            />
            <label className="form-label">Message</label>
            <textarea
              className="form-control mb-3"
              rows="3"
              required
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Write your update…"
            />
            <button className="btn btn-primary">Publish announcement →</button>
          </form>
        </section>
      )}
      <div className="announcement-grid">
        {rows.map((a) => (
          <article className="panel announcement-card" key={a._id}>
            <div className="announcement-mark big">✦</div>
            <div className="announcement-date">
              {new Date(a.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </div>
            <h3>{a.title}</h3>
            <p>{a.body}</p>
            <div className="announcement-author">Posted by {a.author?.name || "StaffSync"}</div>
          </article>
        ))}
      </div>
      {!rows.length && (
        <section className="panel">
          <Empty text="No announcements published yet." />
        </section>
      )}
    </>
  );
}

function TrainingsPage() {
  const user = useSelector((s) => s.auth.user);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", date: "", duration: "1 hour" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const { data } = await api.get("/trainings");
    setRows(data);
  }

  useEffect(() => {
    load().catch((e) => setError(e.response?.data?.message || "Could not load training programs"));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post("/trainings", form);
      setForm({ title: "", description: "", date: "", duration: "1 hour" });
      setMessage("Training program created.");
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not create training");
    }
  }

  return (
    <>
      <PageHeading kicker="LEARNING & DEVELOPMENT" title="Training programs" subtitle="Discover opportunities to learn, grow, and build new skills." />
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}
      {user?.role !== "employee" && (
        <section className="panel form-panel mb-4">
          <div className="panel-head">
            <div>
              <h3>Create training program</h3>
              <p>Add a new learning opportunity for your organization.</p>
            </div>
          </div>
          <form onSubmit={submit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Program title</label>
              <input className="form-control" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Date</label>
              <input
                className="form-control"
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Duration</label>
              <input className="form-control" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            </div>
            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="2"
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="col-12">
              <button className="btn btn-primary">Add program →</button>
            </div>
          </form>
        </section>
      )}
      <div className="training-grid">
        {rows.map((t, i) => (
          <article className="panel training-card" key={t._id}>
            <div className={`training-art art-${i % 3}`}>
              <span>{["✦", "◎", "↗"][i % 3]}</span>
              <small>LEARNING SERIES</small>
            </div>
            <div className="training-card-body">
              <div className="training-date">
                ◷ &nbsp; {new Date(`${t.date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} · {t.duration}
              </div>
              <h3>{t.title}</h3>
              <p>{t.description}</p>
              <div className="announcement-author">Organized by {t.createdBy?.name || "StaffSync"}</div>
            </div>
          </article>
        ))}
      </div>
      {!rows.length && (
        <section className="panel">
          <Empty text="No training programs available yet." />
        </section>
      )}
    </>
  );
}

function EmployeesPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "employee", department: "Engineering", jobTitle: "Employee" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const { data } = await api.get("/employees");
    setRows(data);
  }

  useEffect(() => {
    load().catch((e) => setError(e.response?.data?.message || "Could not load employee directory"));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post("/employees", form);
      setForm({ name: "", email: "", password: "", role: "employee", department: "Engineering", jobTitle: "Employee" });
      setShow(false);
      setMessage("Employee account created.");
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not create employee");
    }
  }

  return (
    <>
      <PageHeading
        kicker="PEOPLE DIRECTORY"
        title="Employees"
        subtitle="Manage your organization's people and team information."
        action={
          <button className="btn btn-primary" onClick={() => setShow(!show)}>
            {show ? "Cancel" : "+ Add employee"}
          </button>
        }
      />
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}
      {show && (
        <section className="panel form-panel mb-4">
          <div className="panel-head">
            <div>
              <h3>Add a team member</h3>
              <p>Create an account with the appropriate access level.</p>
            </div>
          </div>
          <form onSubmit={submit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Full name</label>
              <input className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Work email</label>
              <input className="form-control" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Temporary password</label>
              <input
                className="form-control"
                type="password"
                minLength="8"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Department</label>
              <select className="form-select" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                {["Engineering", "Human Resources", "Marketing", "Finance", "Operations", "Sales"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Job title</label>
              <input className="form-control" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} />
            </div>
            <div className="col-12">
              <button className="btn btn-primary">Create employee →</button>
            </div>
          </form>
        </section>
      )}
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Team directory</h3>
            <p>{rows.length} team member{rows.length === 1 ? "" : "s"} in view</p>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Job title</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id}>
                  <td>
                    <div className="employee-cell">
                      <div className="list-avatar">{r.name?.[0]}</div>
                      <div>
                        <strong>{r.name}</strong>
                        <div className="small text-secondary">{r.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{r.department}</td>
                  <td>{r.jobTitle}</td>
                  <td><span className={`role-badge ${r.role}`}>{r.role}</span></td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <Empty text="No team members found." />}
        </div>
      </section>
    </>
  );
}

function ProfilePage() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    department: user?.department || "",
    jobTitle: user?.jobTitle || ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      const { data } = await api.patch("/auth/profile", form);
      dispatch(setUser(data.user));
      setMessage("Profile updated.");
    } catch (e) {
      setError(e.response?.data?.message || "Could not update profile");
    }
  }

  return (
    <>
      <PageHeading kicker="YOUR ACCOUNT" title="My profile" subtitle="Keep your personal and work information up to date." />
      <section className="panel form-panel profile-panel">
        <div className="profile-header">
          <div className="profile-large">{user?.name?.[0] || "U"}</div>
          <div>
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
            <span className={`role-badge ${user?.role}`}>{user?.role}</span>
          </div>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        <form onSubmit={submit} className="row g-3 mt-2">
          <div className="col-md-6">
            <label className="form-label">Full name</label>
            <input className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Phone</label>
            <input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Department</label>
            <input className="form-control" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Job title</label>
            <input className="form-control" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} />
          </div>
          <div className="col-12">
            <button className="btn btn-primary">Save profile →</button>
          </div>
        </form>
      </section>
    </>
  );
}

function App() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem("staffsync_token")) {
      api
        .get("/auth/me")
        .then(({ data }) => dispatch(setUser(data.user)))
        .catch(() => dispatch(logout()));
    }
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <AuthPage mode="login" />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <AuthPage mode="register" />} />
      <Route path="/" element={<Protected><Layout><Dashboard /></Layout></Protected>} />
      <Route path="/attendance" element={<Protected><Layout><AttendancePage /></Layout></Protected>} />
      <Route path="/leaves" element={<Protected><Layout><LeavesPage /></Layout></Protected>} />
      <Route path="/announcements" element={<Protected><Layout><AnnouncementsPage /></Layout></Protected>} />
      <Route path="/trainings" element={<Protected><Layout><TrainingsPage /></Layout></Protected>} />
      <Route path="/employees" element={<Protected><Layout>{user?.role === "employee" ? <Navigate to="/" /> : <EmployeesPage />}</Layout></Protected>} />
      <Route path="/profile" element={<Protected><Layout><ProfilePage /></Layout></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
