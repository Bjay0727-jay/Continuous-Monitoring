import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchIntegrations,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  triggerPoll,
} from '../api/integrations.api';
import { IntegrationCreateInput, IntegrationUpdateInput } from '@forgecomply/shared';

export function useIntegrations() {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: fetchIntegrations,
    refetchInterval: 10_000,
  });
}

export function useCreateIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: IntegrationCreateInput) => createIntegration(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: IntegrationUpdateInput }) =>
      updateIntegration(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteIntegration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useTriggerPoll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => triggerPoll(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['findings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
