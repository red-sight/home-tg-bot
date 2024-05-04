import { Flow } from '../Flow';

export const newChatGroupProcessedFlow = new Flow<{ id: number }>({
  name: 'new-chat-group-processed',
});
