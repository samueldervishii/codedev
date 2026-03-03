import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@devhub/shared';
import { useRegister } from '../hooks/useAuth';
import { Code2 } from 'lucide-react';

export function RegisterPage() {
  const signup = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  return (
    <>
      <Helmet>
        <title>Sign Up - DevHub</title>
      </Helmet>
      <div className="mx-auto max-w-sm py-16">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-600">
            <Code2 className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Sign Up</h1>
          <p className="mt-1 text-sm text-gray-400">Join the developer community</p>
        </div>

        <form
          onSubmit={handleSubmit((data) => signup.mutate(data))}
          className="space-y-4 rounded-xl border border-gray-800 bg-gray-900 p-6"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Username</label>
            <input
              {...register('username')}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-500"
              placeholder="cooldev42"
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              {...register('email')}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-500"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              {...register('password')}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-500"
              placeholder="Min. 8 characters"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={signup.isPending}
            className="w-full cursor-pointer rounded-full bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {signup.isPending ? 'Creating account...' : 'Sign Up'}
          </button>

          <p className="text-center text-sm text-gray-400">
            Already a member?{' '}
            <Link to="/login" className="cursor-pointer font-medium text-brand-400 hover:text-brand-300">
              Log In
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
