import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCommunitySchema, type CreateCommunityInput } from '@devhub/shared';
import { useCreateCommunity } from '../hooks/useCommunities';

export function CreateCommunityPage() {
  const navigate = useNavigate();
  const createCommunity = useCreateCommunity();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCommunityInput>({ resolver: zodResolver(createCommunitySchema) });

  const onSubmit = (data: CreateCommunityInput) => {
    createCommunity.mutate(data, {
      onSuccess: () => navigate(`/c/${data.name}`),
    });
  };

  return (
    <>
      <Helmet>
        <title>Create Community - DevHub</title>
      </Helmet>

      <div className="mx-auto max-w-lg py-4">
        <h1 className="mb-6 text-xl font-bold text-white">Create a Community</h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 rounded-xl border border-gray-800 bg-gray-900 p-6"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Community Name
            </label>
            <div className="flex items-center rounded-lg border border-gray-700 bg-gray-800">
              <span className="pl-3 text-sm text-gray-500">c/</span>
              <input
                {...register('name')}
                className="w-full bg-transparent px-1 py-2 text-sm text-white placeholder-gray-500 outline-none"
                placeholder="javascript"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Letters, numbers, and underscores only. Cannot be changed later.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Display Name <span className="text-gray-500">(optional)</span>
            </label>
            <input
              {...register('displayName')}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-500"
              placeholder="JavaScript"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-500"
              placeholder="What is this community about?"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-full border border-gray-700 px-5 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createCommunity.isPending}
              className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-50"
            >
              {createCommunity.isPending ? 'Creating...' : 'Create Community'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
