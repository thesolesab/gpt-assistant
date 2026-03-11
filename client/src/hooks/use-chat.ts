import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { Message } from "@shared/schema";

export function useChatHistory() {
  return useQuery({
    queryKey: [api.chat.history.path],
    queryFn: async () => {
      const res = await fetch(api.chat.history.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch chat history");
      return api.chat.history.responses[200].parse(await res.json());
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (message: string) => {
      const payload = api.chat.send.input.parse({ message });
      const res = await fetch(api.chat.send.path, {
        method: api.chat.send.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to send message");
      }
      
      return api.chat.send.responses[200].parse(await res.json());
    },
    onMutate: async (newMessage) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: [api.chat.history.path] });
      
      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData<Message[]>([api.chat.history.path]);
      
      // Optimistically add the new message to the UI
      const optimisticMessage: Message = {
        id: Date.now(), // temporary ID
        content: newMessage,
        role: "user",
        createdAt: new Date(),
      };
      
      queryClient.setQueryData<Message[]>([api.chat.history.path], (old) => {
        return [...(old || []), optimisticMessage];
      });
      
      // Return a context object with the snapshotted value
      return { previousMessages };
    },
    onSuccess: () => {
      // On success, invalidate the query to refetch the true history including the bot's reply
      queryClient.invalidateQueries({ queryKey: [api.chat.history.path] });
    },
    onError: (err, newTodo, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousMessages) {
        queryClient.setQueryData([api.chat.history.path], context.previousMessages);
      }
    },
  });
}
