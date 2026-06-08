export const ASSISTANT_KNOWLEDGE_PAGE_SIZE = 10;

export type AssistantKnowledgeListItem = {
  id: number;
  slug: string;
  keywords: string[];
  questionEn: string;
  questionId: string | null;
  answerEn: string;
  answerId: string | null;
  priority: number;
  isPublished: boolean;
  updatedAt: Date;
};

export type AssistantKnowledgeListResult = {
  items: AssistantKnowledgeListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
