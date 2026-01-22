// Chat store with Svelte 5 runes

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// Example data
const exampleChats: Chat[] = [
  {
    id: "chat-1",
    title: "Understanding TypeScript generics",
    messages: [
      {
        id: "msg-1",
        role: "user",
        content:
          "Can you explain TypeScript generics with a practical example?",
        timestamp: new Date("2025-01-21T10:00:00"),
      },
      {
        id: "msg-2",
        role: "assistant",
        content:
          'TypeScript generics allow you to create reusable components that work with multiple types while maintaining type safety.\n\nHere\'s a practical example:\n\n```typescript\nfunction identity<T>(arg: T): T {\n  return arg;\n}\n\n// Usage:\nconst num = identity<number>(42);    // T is number\nconst str = identity<string>("hello"); // T is string\n```\n\nA more useful example would be a generic `useState` hook:\n\n```typescript\nfunction useState<T>(initial: T): [T, (value: T) => void] {\n  let state = initial;\n  const setState = (value: T) => {\n    state = value;\n  };\n  return [state, setState];\n}\n```\n\nThis ensures type safety while being reusable across different types.',
        timestamp: new Date("2025-01-21T10:00:30"),
      },
      {
        id: "msg-3",
        role: "user",
        content: "What about generic constraints?",
        timestamp: new Date("2025-01-21T10:01:00"),
      },
      {
        id: "msg-4",
        role: "assistant",
        content:
          'Generic constraints let you limit what types can be used with a generic. Use the `extends` keyword:\n\n```typescript\ninterface HasLength {\n  length: number;\n}\n\nfunction logLength<T extends HasLength>(arg: T): void {\n  console.log(arg.length); // Safe!\n}\n\nlogLength("hello");     // OK - strings have length\nlogLength([1, 2, 3]);   // OK - arrays have length\nlogLength(123);         // Error - numbers don\'t have length\n```\n\nThis is powerful for building type-safe utilities.',
        timestamp: new Date("2025-01-21T10:01:30"),
      },
    ],
    createdAt: new Date("2025-01-21T10:00:00"),
    updatedAt: new Date("2025-01-21T10:01:30"),
  },
  {
    id: "chat-2",
    title: "Svelte 5 runes explained",
    messages: [
      {
        id: "msg-5",
        role: "user",
        content: "What are runes in Svelte 5 and how do they work?",
        timestamp: new Date("2025-01-20T15:00:00"),
      },
      {
        id: "msg-6",
        role: "assistant",
        content:
          "Runes are Svelte 5's new reactive primitives. They replace the old `$:` syntax with explicit functions:\n\n**$state** - Creates reactive state\n```svelte\n<script>\n  let count = $state(0);\n</script>\n```\n\n**$derived** - Computed values that update automatically\n```svelte\n<script>\n  let count = $state(0);\n  let doubled = $derived(count * 2);\n</script>\n```\n\n**$effect** - Side effects that run when dependencies change\n```svelte\n<script>\n  let count = $state(0);\n  $effect(() => {\n    console.log(`Count is now ${count}`);\n  });\n</script>\n```\n\nRunes make reactivity explicit and work outside `.svelte` files too!",
        timestamp: new Date("2025-01-20T15:00:45"),
      },
    ],
    createdAt: new Date("2025-01-20T15:00:00"),
    updatedAt: new Date("2025-01-20T15:00:45"),
  },
  {
    id: "chat-3",
    title: "CSS Grid vs Flexbox",
    messages: [
      {
        id: "msg-7",
        role: "user",
        content: "When should I use CSS Grid vs Flexbox?",
        timestamp: new Date("2025-01-19T09:30:00"),
      },
      {
        id: "msg-8",
        role: "assistant",
        content:
          "Here's a simple way to think about it:\n\n**Flexbox** - One-dimensional layouts (row OR column)\n- Navigation bars\n- Card content alignment\n- Centering elements\n- Dynamic spacing between items\n\n**Grid** - Two-dimensional layouts (rows AND columns)\n- Page layouts\n- Gallery/grid of cards\n- Complex form layouts\n- Anything that needs alignment in both directions\n\n**Rule of thumb:**\n- If your layout flows in one direction → Flexbox\n- If you need to control placement in both axes → Grid\n\nThey work great together too! Use Grid for the overall page structure and Flexbox for component internals.",
        timestamp: new Date("2025-01-19T09:30:30"),
      },
    ],
    createdAt: new Date("2025-01-19T09:30:00"),
    updatedAt: new Date("2025-01-19T09:30:30"),
  },
  {
    id: "chat-4",
    title: "Building REST APIs",
    messages: [
      {
        id: "msg-9",
        role: "user",
        content: "What are the best practices for designing REST APIs?",
        timestamp: new Date("2025-01-18T14:20:00"),
      },
      {
        id: "msg-10",
        role: "assistant",
        content:
          'Key REST API best practices:\n\n**1. Use nouns, not verbs**\n- Good: `GET /users/123`\n- Bad: `GET /getUser/123`\n\n**2. Use proper HTTP methods**\n- GET - Read\n- POST - Create\n- PUT/PATCH - Update\n- DELETE - Delete\n\n**3. Use meaningful status codes**\n- 200 OK, 201 Created, 204 No Content\n- 400 Bad Request, 401 Unauthorized, 404 Not Found\n- 500 Internal Server Error\n\n**4. Version your API**\n- `/api/v1/users`\n\n**5. Use pagination for lists**\n```\nGET /users?page=2&limit=20\n```\n\n**6. Handle errors consistently**\n```json\n{\n  "error": {\n    "code": "VALIDATION_ERROR",\n    "message": "Email is required"\n  }\n}\n```',
        timestamp: new Date("2025-01-18T14:21:00"),
      },
    ],
    createdAt: new Date("2025-01-18T14:20:00"),
    updatedAt: new Date("2025-01-18T14:21:00"),
  },
  {
    id: "chat-5",
    title: "Quick regex question",
    messages: [
      {
        id: "msg-11",
        role: "user",
        content: "How do I match an email address with regex?",
        timestamp: new Date("2025-01-17T11:00:00"),
      },
      {
        id: "msg-12",
        role: "assistant",
        content:
          "Here's a practical email regex:\n\n```javascript\nconst emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n```\n\nThis checks for:\n- No spaces or @ before the @\n- An @ symbol\n- No spaces or @ after the @\n- A dot\n- Something after the dot\n\nFor production, consider using a validation library instead of regex alone, as email validation is more complex than it seems.",
        timestamp: new Date("2025-01-17T11:00:20"),
      },
    ],
    createdAt: new Date("2025-01-17T11:00:00"),
    updatedAt: new Date("2025-01-17T11:00:20"),
  },
];

// Chat store using Svelte 5 runes
function createChatStore() {
  let chats = $state<Chat[]>(exampleChats);
  let currentChatId = $state<string | null>(null);

  const currentChat = $derived(
    chats.find((c) => c.id === currentChatId) ?? null,
  );

  const sortedChats = $derived(
    [...chats].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
  );

  // Group chats by date
  const groupedChats = $derived(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const groups: { label: string; chats: Chat[] }[] = [
      { label: "Today", chats: [] },
      { label: "Yesterday", chats: [] },
      { label: "Last 7 Days", chats: [] },
      { label: "Older", chats: [] },
    ];

    for (const chat of sortedChats) {
      const chatDate = new Date(
        chat.updatedAt.getFullYear(),
        chat.updatedAt.getMonth(),
        chat.updatedAt.getDate(),
      );

      if (chatDate >= today) {
        groups[0].chats.push(chat);
      } else if (chatDate >= yesterday) {
        groups[1].chats.push(chat);
      } else if (chatDate >= lastWeek) {
        groups[2].chats.push(chat);
      } else {
        groups[3].chats.push(chat);
      }
    }

    return groups.filter((g) => g.chats.length > 0);
  });

  function selectChat(id: string | null) {
    currentChatId = id;
  }

  function createChat(): Chat {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    chats = [newChat, ...chats];
    currentChatId = newChat.id;
    return newChat;
  }

  function addMessage(
    chatId: string,
    content: string,
    role: "user" | "assistant",
  ) {
    const chat = chats.find((c) => c.id === chatId);
    if (!chat) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      role,
      content,
      timestamp: new Date(),
    };

    chat.messages = [...chat.messages, message];
    chat.updatedAt = new Date();

    // Update title if it's the first user message
    if (role === "user" && chat.messages.length === 1) {
      chat.title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
    }

    // Trigger reactivity
    chats = [...chats];
  }

  function deleteChat(id: string) {
    chats = chats.filter((c) => c.id !== id);
    if (currentChatId === id) {
      currentChatId = chats[0]?.id ?? null;
    }
  }

  return {
    get chats() {
      return chats;
    },
    get currentChatId() {
      return currentChatId;
    },
    get currentChat() {
      return currentChat;
    },
    get sortedChats() {
      return sortedChats;
    },
    get groupedChats() {
      return groupedChats();
    },
    selectChat,
    createChat,
    addMessage,
    deleteChat,
  };
}

export const chatStore = createChatStore();
