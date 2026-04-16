import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="not-found">
      <h2>404</h2>
      <p>The page you are looking for does not exist.</p>
      <Link to="/dashboard">Go to Dashboard</Link>
    </section>
  );
}

export default NotFoundPage;
