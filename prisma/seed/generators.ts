import {
  QuestionFormat,
  QuestionSkill,
} from "@prisma/client";
import type { TopicCatalogEntry } from "./catalog";
import {
  MATERIAL_SLOTS,
  QUESTION_SLOTS,
  SEED_SCALE,
} from "./config";
import {
  buildMaterial,
  buildQuestion,
  bulletList,
  distributeWeights,
  heading,
  p,
  renumberItems,
  sq,
  type ContentItem,
} from "./helpers";

const SKILLS_ROTATION: QuestionSkill[] = [
  QuestionSkill.READING,
  QuestionSkill.WRITING,
  QuestionSkill.SPEAKING,
  QuestionSkill.LISTENING,
];

function formatsForSkill(skill: QuestionSkill): QuestionFormat[] {
  switch (skill) {
    case QuestionSkill.SPEAKING:
      return [
        QuestionFormat.SPEECH_RECOGNITION,
        QuestionFormat.ESSAY,
        QuestionFormat.MULTIPLE_CHOICE,
      ];
    case QuestionSkill.READING:
      return [
        QuestionFormat.MULTIPLE_CHOICE,
        QuestionFormat.YES_NO,
        QuestionFormat.ESSAY,
      ];
    case QuestionSkill.WRITING:
      return [
        QuestionFormat.ESSAY,
        QuestionFormat.MULTIPLE_CHOICE,
        QuestionFormat.YES_NO,
      ];
    case QuestionSkill.LISTENING:
      return [
        QuestionFormat.MULTIPLE_CHOICE,
        QuestionFormat.YES_NO,
        QuestionFormat.ESSAY,
      ];
    default:
      return [QuestionFormat.MULTIPLE_CHOICE];
  }
}

function pickSubQuestionCount(questionIndex: number): number {
  const range =
    SEED_SCALE.subQuestionsMax - SEED_SCALE.subQuestionsMin + 1;
  return SEED_SCALE.subQuestionsMin + (questionIndex % range);
}

function buildMaterialFromSection(
  topic: TopicCatalogEntry,
  sectionTitle: string,
  sectionIndex: number
) {
  const vocabSlice = topic.vocab.slice(
    sectionIndex % topic.vocab.length,
    (sectionIndex % topic.vocab.length) + 4
  );
  const vocabItems =
    vocabSlice.length > 0
      ? vocabSlice
      : topic.vocab.slice(0, Math.min(4, topic.vocab.length));

  return buildMaterial(
    {
      title: sectionTitle,
      contentNodes: [
        heading(2, sectionTitle),
        p(
          `In this lesson on ${topic.title.toLowerCase()}, you will learn key vocabulary and useful expressions for everyday English communication.`
        ),
        heading(3, "Key Vocabulary"),
        bulletList(
          vocabItems.map((word) => `${word} — common word in ${topic.title}`)
        ),
        heading(3, "Practice"),
        p(
          `Read the vocabulary aloud, then make two example sentences using words from ${sectionTitle.toLowerCase()}.`
        ),
      ],
    },
    0
  );
}

function buildSubQuestion(
  topic: TopicCatalogEntry,
  questionIndex: number,
  subIndex: number,
  weight: number
) {
  const skill = SKILLS_ROTATION[(questionIndex + subIndex) % SKILLS_ROTATION.length]!;
  const formats = formatsForSkill(skill);
  const format = formats[subIndex % formats.length]!;
  const stem =
    topic.questionStems[questionIndex % topic.questionStems.length] ??
    `Question about ${topic.title}`;
  const questionText = `${stem} (Part ${subIndex + 1})`;
  const isMicrophoneStem = /into the microphone|Say ['"]/i.test(stem);

  const base = {
    order: subIndex,
    skill: isMicrophoneStem ? QuestionSkill.SPEAKING : skill,
    format: isMicrophoneStem ? QuestionFormat.SPEECH_RECOGNITION : format,
    weightPercent: weight,
    questionText,
  };

  if (isMicrophoneStem) {
    const parsed = stem.match(/Say\s+['"]([^'"]+)['"]/i);
    const phrase =
      parsed?.[1] ??
      topic.vocab[subIndex % topic.vocab.length] ??
      "Hello";
    return sq({
      ...base,
      skill: QuestionSkill.SPEAKING,
      format: QuestionFormat.SPEECH_RECOGNITION,
      questionText: `Say "${phrase}" clearly into the microphone.`,
      expectedSpeech: phrase,
    });
  }

  if (format === QuestionFormat.MULTIPLE_CHOICE) {
    const correct = topic.vocab[subIndex % topic.vocab.length] ?? "Answer";
    const distractors = [
      topic.vocab[(subIndex + 1) % topic.vocab.length] ?? "Option B",
      topic.vocab[(subIndex + 2) % topic.vocab.length] ?? "Option C",
      topic.vocab[(subIndex + 3) % topic.vocab.length] ?? "Option D",
    ];
    return sq({
      ...base,
      options: [correct, ...distractors],
      correctAnswer: correct,
      explanation: `The correct answer is "${correct}" based on ${topic.title}.`,
    });
  }

  if (format === QuestionFormat.YES_NO) {
    return sq({
      ...base,
      options: ["Yes", "No"],
      correctAnswer: subIndex % 2 === 0 ? "Yes" : "No",
      explanation: `This checks understanding of ${topic.title}.`,
    });
  }

  if (format === QuestionFormat.SPEECH_RECOGNITION) {
    const phrase = topic.vocab[subIndex % topic.vocab.length] ?? "Hello";
    return sq({
      ...base,
      skill: QuestionSkill.SPEAKING,
      format: QuestionFormat.SPEECH_RECOGNITION,
      questionText: `Say "${phrase}" clearly into the microphone.`,
      expectedSpeech: phrase,
    });
  }

  return sq({
    ...base,
    essayRubric: `Check for: topic relevance to ${topic.title}, complete sentences, clear ideas.`,
  });
}

function buildGeneratedQuestion(topic: TopicCatalogEntry, questionIndex: number) {
  const subCount = pickSubQuestionCount(questionIndex);
  const weights = distributeWeights(subCount);
  let subQuestions = weights.map((weight, subIndex) =>
    buildSubQuestion(topic, questionIndex, subIndex, weight)
  );

  if (
    !subQuestions.some((sub) => sub.format === QuestionFormat.SPEECH_RECOGNITION)
  ) {
    const speechIdx = questionIndex % subQuestions.length;
    const phrase = topic.vocab[speechIdx % topic.vocab.length] ?? "Hello";
    const base = subQuestions[speechIdx]!;
    subQuestions[speechIdx] = sq({
      order: base.order,
      skill: QuestionSkill.SPEAKING,
      format: QuestionFormat.SPEECH_RECOGNITION,
      weightPercent: base.weightPercent,
      questionText: `Say "${phrase}" clearly into the microphone.`,
      expectedSpeech: phrase,
    });
  }

  return buildQuestion(subQuestions, 0);
}

export function generateMaterials(
  topic: TopicCatalogEntry,
  count: number
): ReturnType<typeof buildMaterial>[] {
  return Array.from({ length: count }, (_, i) => {
    const sectionTitle = topic.sections[i % topic.sections.length]!;
    return buildMaterialFromSection(topic, sectionTitle, i);
  });
}

export function generateQuestions(
  topic: TopicCatalogEntry,
  count: number
): ReturnType<typeof buildQuestion>[] {
  return Array.from({ length: count }, (_, i) =>
    buildGeneratedQuestion(topic, i)
  );
}

/** Merge materials and questions into the standard 15-item slot layout. */
export function interleaveContent(
  materials: ReturnType<typeof buildMaterial>[],
  questions: ReturnType<typeof buildQuestion>[]
): ContentItem[] {
  const items: ContentItem[] = [];

  for (let i = 0; i < MATERIAL_SLOTS.length; i++) {
    const slot = MATERIAL_SLOTS[i]!;
    const material = materials[i];
    if (material) {
      items.push({ ...material, order: slot });
    }
  }

  for (let i = 0; i < QUESTION_SLOTS.length; i++) {
    const slot = QUESTION_SLOTS[i]!;
    const question = questions[i];
    if (question) {
      items.push({ ...question, order: slot });
    }
  }

  return items.sort((a, b) => a.order - b.order);
}

export function generateGroupContent(topic: TopicCatalogEntry): ContentItem[] {
  const materials = generateMaterials(topic, SEED_SCALE.materialsPerGroup);
  const questions = generateQuestions(topic, SEED_SCALE.questionsPerGroup);
  return interleaveContent(materials, questions);
}

/** Pad legacy handcrafted content to the target scale. */
export function padGroupToScale(
  legacyItems: ContentItem[],
  topic: TopicCatalogEntry
): ContentItem[] {
  const legacyMaterials = legacyItems
    .filter((item) => item.type === "MATERIAL")
    .sort((a, b) => a.order - b.order);
  const legacyQuestions = legacyItems
    .filter((item) => item.type === "QUESTION")
    .sort((a, b) => a.order - b.order);

  const neededMaterials = SEED_SCALE.materialsPerGroup - legacyMaterials.length;
  const neededQuestions = SEED_SCALE.questionsPerGroup - legacyQuestions.length;

  const extraMaterials =
    neededMaterials > 0 ? generateMaterials(topic, neededMaterials) : [];
  const extraQuestions =
    neededQuestions > 0 ? generateQuestions(topic, neededQuestions) : [];

  const allMaterials = [...legacyMaterials, ...extraMaterials].slice(
    0,
    SEED_SCALE.materialsPerGroup
  );
  const allQuestions = [...legacyQuestions, ...extraQuestions].slice(
    0,
    SEED_SCALE.questionsPerGroup
  );

  // Fill any remaining gap if legacy had fewer than expected
  while (allMaterials.length < SEED_SCALE.materialsPerGroup) {
    allMaterials.push(
      ...generateMaterials(topic, SEED_SCALE.materialsPerGroup - allMaterials.length)
    );
  }
  while (allQuestions.length < SEED_SCALE.questionsPerGroup) {
    allQuestions.push(
      ...generateQuestions(topic, SEED_SCALE.questionsPerGroup - allQuestions.length)
    );
  }

  return renumberItems(
    interleaveContent(
      allMaterials.slice(0, SEED_SCALE.materialsPerGroup),
      allQuestions.slice(0, SEED_SCALE.questionsPerGroup)
    )
  );
}
