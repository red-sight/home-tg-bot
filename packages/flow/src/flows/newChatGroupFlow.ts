import { Flow } from '../Flow';

export const newChatGroupFlow = new Flow<{ id: number }>({
  name: 'new-chat-group',
});
