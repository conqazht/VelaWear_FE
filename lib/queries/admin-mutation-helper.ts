import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invalidatePublicQueries, type PublicCacheArea } from "@/lib/queries/public-cache";

export interface AdminMutationOptions<TVariables, TData> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  invalidateKeys?: (variables: TVariables, data: TData) => readonly (readonly unknown[])[];
  publicAreas?: readonly PublicCacheArea[];
  onSuccess?: (data: TData, variables: TVariables) => Promise<void> | void;
}

export function useAdminMutation<TVariables, TData>({
  mutationFn,
  invalidateKeys,
  publicAreas,
  onSuccess,
}: AdminMutationOptions<TVariables, TData>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async (data, variables) => {
      const keys = invalidateKeys ? invalidateKeys(variables, data) : [];
      const promises: Promise<unknown>[] = keys.map((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      );

      if (publicAreas && publicAreas.length > 0) {
        promises.push(invalidatePublicQueries(queryClient, publicAreas));
      }

      if (onSuccess) {
        promises.push(Promise.resolve(onSuccess(data, variables)));
      }

      await Promise.all(promises);
    },
  });
}
