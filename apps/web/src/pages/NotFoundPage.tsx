import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <>
    <Helmet><title>Page Not Found - DevHub</title></Helmet>
    <div className="py-20 text-center">
      <h1 className="text-4xl font-bold text-white">404</h1>
      <p className="mt-2 text-gray-400">Page not found</p>
      <Link to="/" className="mt-4 inline-block cursor-pointer text-brand-500 hover:text-brand-400">
        Go home
      </Link>
    </div>
    </>
  );
}
