import { Link } from "react-router-dom";

const spaces = [
  {
    title: "Infrasturcture support",
    copy: "Find the right technician, track issue resolution, and keep campus facilities running smoothly with a connected ticketing system.",
    image: "/home/campus-learning-space.jpeg",
  },
  {
    title: "IT laboratories",
    copy: "Coordinate computer labs, workstation availability, and technology support from one place.",
    image: "/home/it-lab-students.jpg",
  },
  {
    title: "Teaching resources",
    copy: "Track rooms, equipment, projectors, and maintenance requests across campus operations.",
    image: "/home/it-lab-workstations.jpg",
  },
];

function HomePage() {
  return (
    <div className="home-page">
      <header className="home-nav">
        <Link to="/" className="home-brand" aria-label="Smart Campus home">
          <span className="home-brand-mark">SC</span>
          <span>
            <strong>Smart Campus</strong>
            <small>SLIIT Facilities and Assets</small>
          </span>
        </Link>
        <nav className="home-nav-links" aria-label="Home navigation">
          <a href="#operations">Operations</a>
          <a href="#spaces">Spaces</a>
          <Link to="/login" className="home-login-link">Login</Link>
        </nav>
      </header>

      <main>
        <section className="home-hero">
          <img
            src="/home/library-collaboration.jpg"
            alt="SLIIT collaborative learning space"
            className="home-hero-image"
          />
          <div className="home-hero-shade" />
          <div className="home-hero-content">
            <p className="home-kicker">Campus operations platform</p>
            <h1>Manage SLIIT spaces, assets, bookings, and service tickets with one connected workflow.</h1>
            <p>
              A practical portal for students, technicians, and administrators to request facilities,
              reserve shared resources, and keep campus assets available for teaching and learning.
            </p>
            <div className="home-hero-actions">
              <Link to="/login" className="home-primary-action">Login to Smart Campus</Link>
              <a href="#spaces" className="home-secondary-action">View managed spaces</a>
            </div>
          </div>
        </section>

        <section className="home-section home-operations" id="operations">
          <div className="home-section-heading">
            <p className="home-kicker">Operational coverage</p>
            <h2>Built around the daily movement of a real campus.</h2>
          </div>
          <div className="home-metrics">
            <div>
              <strong>Bookings</strong>
              <span>Reserve rooms, laboratories, and equipment with approval tracking.</span>
            </div>
            <div>
              <strong>Tickets</strong>
              <span>Report issues, attach evidence, assign technicians, and monitor SLA timing.</span>
            </div>
            <div>
              <strong>Assets</strong>
              <span>Keep resource details, availability, status, and location data visible.</span>
            </div>
          </div>
        </section>

        <section className="home-section" id="spaces">
          <div className="home-section-heading">
            <p className="home-kicker">Campus spaces</p>
            <h2>Facilities presented with the context teams need before they book or respond.</h2>
          </div>
          <div className="home-space-grid">
            {spaces.map((space) => (
              <article className="home-space-card" key={space.title}>
                <img src={space.image} alt={space.title} />
                <div>
                  <h3>{space.title}</h3>
                  <p>{space.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="home-final-band">
          <div>
            <p className="home-kicker">Ready for campus work</p>
            <h2>Sign in to create bookings, manage assets, or respond to support tickets.</h2>
          </div>
          <Link to="/login" className="home-primary-action">Open portal</Link>
        </section>
      </main>
    </div>
  );
}

export default HomePage;
