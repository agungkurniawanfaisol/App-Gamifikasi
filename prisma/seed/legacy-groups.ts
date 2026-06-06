import { QuestionFormat, QuestionSkill } from "@prisma/client";
import {
  buildMaterial,
  buildQuestion,
  bulletList,
  heading,
  italicTag,
  p,
  sq,
} from "./helpers";

function greetingsAndIntroductions() {
  return [
    // 1. Material
    buildMaterial(
      {
        title: "Greetings in English",
        contentNodes: [
          heading(2, "Greetings in English"),
          p("Hello and welcome! In this lesson, we'll learn how to greet people in English."),
          heading(3, "Common Greetings"),
          p("Here are the most common greetings:"),
          bulletList([
            `${italicTag("Hello")} — A general greeting you can use anytime`,
            `${italicTag("Hi")} — An informal greeting for friends and family`,
            `${italicTag("Good morning")} — Used before 12:00 PM`,
            `${italicTag("Good afternoon")} — Used from 12:00 PM to 6:00 PM`,
            `${italicTag("Good evening")} — Used after 6:00 PM`,
          ]),
          heading(3, "Responding to Greetings"),
          p("When someone greets you, you can respond with the same greeting. For example:"),
          bulletList([
            `"Hello!" → "Hello!"`,
            `"Good morning!" → "Good morning!"`,
          ]),
          p("Practice these greetings with your classmates every day! Remember to smile when you greet someone — it makes the conversation warmer."),
        ],
      },
      1
    ),
    // 2. Question
    buildQuestion(
      [
        sq({
          order: 0,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 40,
          questionText: "What is the most appropriate greeting to use at 3:00 PM?",
          options: ["Good morning", "Good afternoon", "Good evening", "Good night"],
          correctAnswer: "Good afternoon",
          explanation: "Good afternoon is used from 12:00 PM to around 6:00 PM.",
        }),
        sq({
          order: 1,
          skill: QuestionSkill.SPEAKING,
          format: QuestionFormat.SPEECH_RECOGNITION,
          weightPercent: 30,
          questionText: "Say 'Good morning' clearly into the microphone.",
          expectedSpeech: "Good morning",
        }),
        sq({
          order: 2,
          skill: QuestionSkill.READING,
          format: QuestionFormat.YES_NO,
          weightPercent: 30,
          questionText: "Is 'Hi' considered an informal greeting?",
          options: ["Yes", "No"],
          correctAnswer: "Yes",
          explanation: "Yes, 'Hi' is an informal greeting typically used with friends and family.",
        }),
      ],
      2
    ),
    // 3. Material
    buildMaterial(
      {
        title: "Introducing Yourself",
        contentNodes: [
          heading(2, "Introducing Yourself"),
          p("After greeting someone, the next step is to introduce yourself! Here are some useful phrases:"),
          heading(3, "Basic Introduction Phrases"),
          bulletList([
            `${italicTag("My name is...")} — "My name is John."`,
            `${italicTag("I am from...")} — "I am from Indonesia."`,
            `${italicTag("I am a...")} — "I am a student."`,
            `${italicTag("Nice to meet you.")} — A polite response after an introduction`,
          ]),
          heading(3, "Example Dialogue"),
        p(`${italicTag("A:")} Hello! My name is Sarah.`),
        p(`${italicTag("B:")} Hi Sarah! I'm Mike. Nice to meet you!`),
        p(`${italicTag("A:")} Nice to meet you too, Mike!`),
          p("Try introducing yourself to a partner using these phrases. Remember to smile and make eye contact!"),
        ],
      },
      3
    ),
    // 4. Question
    buildQuestion(
      [
        sq({
          order: 0,
          skill: QuestionSkill.WRITING,
          format: QuestionFormat.ESSAY,
          weightPercent: 50,
          questionText: "Write a short self-introduction. Include your name, where you're from, and one hobby.",
          essayRubric: "Check for: name included, origin mentioned, hobby mentioned, complete sentences.",
        }),
        sq({
          order: 1,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 50,
          questionText: "What is the correct response when someone says 'Nice to meet you'?",
          options: [
            "Nice to meet you too",
            "Goodbye",
            "Thank you",
            "I don't know",
          ],
          correctAnswer: "Nice to meet you too",
          explanation: "'Nice to meet you too' is the standard polite response.",
        }),
      ],
      4
    ),
    // 5. Material
    buildMaterial(
      {
        title: "Polite Expressions",
        contentNodes: [
          heading(2, "Polite Expressions"),
          p("Being polite is very important in English! Here are some key polite expressions:"),
          heading(3, "The Magic Words"),
          bulletList([
            `${italicTag("Please")} — Used when asking for something`,
            `${italicTag("Thank you")} — Used when receiving something`,
            `${italicTag("You're welcome")} — The response to 'thank you'`,
            `${italicTag("Excuse me")} — Used to get someone's attention or apologize`,
            `${italicTag("I'm sorry")} — Used to apologize`,
          ]),
          heading(3, "When to Use Each Expression"),
          p("Use 'Please' when making requests. Use 'Thank you' after someone helps you. Use 'Excuse me' before asking a question in a public place. Use 'I'm sorry' when you make a mistake."),
        ],
      },
      5
    ),
    // 6. Question
    buildQuestion(
      [
        sq({
          order: 0,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 35,
          questionText: "Which word should you use when asking for something?",
          options: ["Sorry", "Please", "Goodbye", "Maybe"],
          correctAnswer: "Please",
          explanation: "'Please' is used when making polite requests.",
        }),
        sq({
          order: 1,
          skill: QuestionSkill.READING,
          format: QuestionFormat.YES_NO,
          weightPercent: 30,
          questionText: "Is 'Excuse me' used to apologize for a small mistake?",
          options: ["Yes", "No"],
          correctAnswer: "Yes",
          explanation: "Yes, 'Excuse me' can be used for small mistakes or to get someone's attention politely.",
        }),
        sq({
          order: 2,
          skill: QuestionSkill.SPEAKING,
          format: QuestionFormat.SPEECH_RECOGNITION,
          weightPercent: 35,
          questionText: "Say 'Thank you very much' into the microphone.",
          expectedSpeech: "Thank you very much",
        }),
      ],
      6
    ),
  ];
}

function numbersAndColors() {
  return [
    // 1. Material
    buildMaterial(
      {
        title: "Numbers 1 to 20",
        contentNodes: [
          heading(2, "Numbers 1 to 20"),
          p("Let's learn how to count from 1 to 20 in English!"),
          heading(3, "Numbers 1–10"),
          p("1: One — 2: Two — 3: Three — 4: Four — 5: Five"),
          p("6: Six — 7: Seven — 8: Eight — 9: Nine — 10: Ten"),
          heading(3, "Numbers 11–20"),
          p("11: Eleven — 12: Twelve — 13: Thirteen — 14: Fourteen — 15: Fifteen"),
          p("16: Sixteen — 17: Seventeen — 18: Eighteen — 19: Nineteen — 20: Twenty"),
          heading(3, "Practice"),
          p("Try counting objects around you! How many books do you see? How many chairs? Counting helps you remember the numbers."),
        ],
      },
      1
    ),
    // 2. Question
    buildQuestion(
      [
        sq({
          order: 0,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 40,
          questionText: "What number comes after fourteen?",
          options: ["Thirteen", "Fifteen", "Sixteen", "Twelve"],
          correctAnswer: "Fifteen",
          explanation: "Fourteen → Fifteen is the correct sequence.",
        }),
        sq({
          order: 1,
          skill: QuestionSkill.SPEAKING,
          format: QuestionFormat.SPEECH_RECOGNITION,
          weightPercent: 30,
          questionText: "Say the number 'seven' into the microphone.",
          expectedSpeech: "seven",
        }),
        sq({
          order: 2,
          skill: QuestionSkill.READING,
          format: QuestionFormat.YES_NO,
          weightPercent: 30,
          questionText: "Is the number 12 spelled as 'twelve'?",
          options: ["Yes", "No"],
          correctAnswer: "Yes",
          explanation: "Yes, 12 is spelled as 'twelve' in English.",
        }),
      ],
      2
    ),
    // 3. Material
    buildMaterial(
      {
        title: "Colors Around Us",
        contentNodes: [
          heading(2, "Colors Around Us"),
          p("Colors are everywhere! Let's learn the names of common colors in English."),
          heading(3, "Primary Colors"),
          bulletList([
            `${italicTag("Red")} — The color of apples and strawberries`,
            `${italicTag("Blue")} — The color of the sky and the ocean`,
            `${italicTag("Yellow")} — The color of the sun and bananas`,
          ]),
          heading(3, "Secondary Colors"),
          bulletList([
            `${italicTag("Green")} — The color of grass and leaves`,
            `${italicTag("Orange")} — The color of oranges`,
            `${italicTag("Purple")} — The color of grapes and lavender`,
          ]),
          heading(3, "Practice"),
          p("Look around your room. What colors do you see? Try naming each object with its color, like 'blue book' or 'red pencil'."),
        ],
      },
      3
    ),
    // 4. Question
    buildQuestion(
      [
        sq({
          order: 0,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 50,
          questionText: "What color is the sky on a clear day?",
          options: ["Red", "Blue", "Green", "Yellow"],
          correctAnswer: "Blue",
          explanation: "The sky appears blue on a clear day.",
        }),
        sq({
          order: 1,
          skill: QuestionSkill.WRITING,
          format: QuestionFormat.ESSAY,
          weightPercent: 50,
          questionText: "Describe your favorite color. Why do you like it? Where can you see this color? Write 3-4 sentences.",
          essayRubric: "Check for: color named, reason given, example location mentioned, complete sentences.",
        }),
      ],
      4
    ),
    // 5. Material
    buildMaterial(
      {
        title: "Counting and Colors Review",
        contentNodes: [
          heading(2, "Review: Numbers and Colors"),
          p("Let's practice combining numbers and colors! Here are some examples:"),
          bulletList([
            "Three red apples",
            "Five blue balloons",
            "Two yellow sunflowers",
            "Seven green leaves",
          ]),
          p("In English, we say the number first, then the color, then the object. For example: 'four orange chairs'."),
          heading(3, "Practice Exercise"),
          p("Try making your own phrases! Count objects of different colors around you and describe them using this pattern."),
        ],
      },
      5
    ),
    // 6. Question
    buildQuestion(
      [
        sq({
          order: 0,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 35,
          questionText: "Which sentence follows the correct English word order?",
          options: [
            "Red three apples",
            "Three red apples",
            "Apples red three",
            "Red apples three",
          ],
          correctAnswer: "Three red apples",
          explanation: "In English, the correct order is: number → color → object.",
        }),
        sq({
          order: 1,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 35,
          questionText: "What color do you get when you mix red and yellow?",
          options: ["Blue", "Green", "Orange", "Purple"],
          correctAnswer: "Orange",
          explanation: "Red and yellow mixed together make orange.",
        }),
        sq({
          order: 2,
          skill: QuestionSkill.SPEAKING,
          format: QuestionFormat.SPEECH_RECOGNITION,
          weightPercent: 30,
          questionText: "Say the number 'fifteen' clearly into the microphone.",
          expectedSpeech: "fifteen",
        }),
      ],
      6
    ),
  ];
}

function dailyLife() {
  return [
    // 1. Material
    buildMaterial(
      {
        title: "Daily Routines",
        contentNodes: [
          heading(2, "Daily Routines"),
          p("Let's learn how to talk about things we do every day!"),
          heading(3, "Morning Routine"),
          bulletList([
            `${italicTag("Wake up")} — I wake up at 6:00 AM.`,
            `${italicTag("Brush my teeth")} — I brush my teeth after waking up.`,
            `${italicTag("Take a shower")} — I take a shower every morning.`,
            `${italicTag("Eat breakfast")} — I eat breakfast at 7:00 AM.`,
            `${italicTag("Go to school")} — I go to school at 7:30 AM.`,
          ]),
          heading(3, "Evening Routine"),
          bulletList([
            `${italicTag("Do homework")} — I do my homework after school.`,
            `${italicTag("Have dinner")} — I have dinner with my family.`,
            `${italicTag("Watch TV")} — I watch TV for one hour.`,
            `${italicTag("Go to bed")} — I go to bed at 9:00 PM.`,
          ]),
        ],
      },
      1
    ),
    // 2. Question
    buildQuestion(
      [
        sq({
          order: 0,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 35,
          questionText: "What do you do first in your morning routine?",
          options: ["Eat breakfast", "Brush teeth", "Wake up", "Go to school"],
          correctAnswer: "Wake up",
          explanation: "Waking up is the first thing you do in the morning.",
        }),
        sq({
          order: 1,
          skill: QuestionSkill.READING,
          format: QuestionFormat.YES_NO,
          weightPercent: 30,
          questionText: "Do you have dinner before doing homework?",
          options: ["Yes", "No"],
          correctAnswer: "No",
          explanation: "Based on the lesson, you do homework after school and have dinner later with family.",
        }),
        sq({
          order: 2,
          skill: QuestionSkill.WRITING,
          format: QuestionFormat.ESSAY,
          weightPercent: 35,
          questionText: "Write about your morning routine. What do you do every morning? Write 3-5 sentences.",
          essayRubric: "Check for: sequence words used (first, then, after), at least 3 activities, complete sentences.",
        }),
      ],
      2
    ),
    // 3. Material
    buildMaterial(
      {
        title: "Food and Drinks",
        contentNodes: [
          heading(2, "Food and Drinks"),
          p("Let's learn the names of common foods and drinks in English!"),
          heading(3, "Common Foods"),
          bulletList([
            `${italicTag("Rice")} — A staple food in many countries`,
            `${italicTag("Bread")} — Made from flour, often eaten for breakfast`,
            `${italicTag("Chicken")} — A type of meat`,
            `${italicTag("Fish")} — Food from the sea`,
            `${italicTag("Eggs")} — Can be fried, boiled, or scrambled`,
            `${italicTag("Vegetables")} — Carrots, broccoli, spinach, and more`,
            `${italicTag("Fruit")} — Apples, bananas, oranges, and more`,
          ]),
          heading(3, "Common Drinks"),
          bulletList([
            `${italicTag("Water")} — The healthiest drink`,
            `${italicTag("Milk")} — Good for strong bones`,
            `${italicTag("Juice")} — Made from fruits`,
            `${italicTag("Tea")} — A hot drink`,
            `${italicTag("Coffee")} — A hot drink with caffeine`,
          ]),
          heading(3, "Useful Phrases"),
          p("I like... / I don't like... / Can I have...? / Would you like...?"),
        ],
      },
      3
    ),
    // 4. Question
    buildQuestion(
      [
        sq({
          order: 0,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 35,
          questionText: "Which of these is considered the healthiest drink?",
          options: ["Coffee", "Juice", "Water", "Tea"],
          correctAnswer: "Water",
          explanation: "Water is the healthiest drink for your body.",
        }),
        sq({
          order: 1,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 35,
          questionText: "Which food is a staple in many countries?",
          options: ["Chicken", "Rice", "Fish", "Bread"],
          correctAnswer: "Rice",
          explanation: "Rice is a staple food in many countries around the world.",
        }),
        sq({
          order: 2,
          skill: QuestionSkill.SPEAKING,
          format: QuestionFormat.SPEECH_RECOGNITION,
          weightPercent: 30,
          questionText: "Say 'I would like some water, please' into the microphone.",
          expectedSpeech: "I would like some water please",
        }),
      ],
      4
    ),
    // 5. Material
    buildMaterial(
      {
        title: "Telling Time",
        contentNodes: [
          heading(2, "Telling Time"),
          p("Learning to tell time is an important skill! Let's practice."),
          heading(3, "Key Phrases"),
          bulletList([
            `${italicTag("What time is it?")} — The question to ask`,
            `${italicTag("It's... o'clock")} — For exact hours`,
            `${italicTag("Half past...")} — For 30 minutes past`,
            `${italicTag("Quarter past...")} — For 15 minutes past`,
            `${italicTag("Quarter to...")} — For 15 minutes before`,
          ]),
          heading(3, "Examples"),
          bulletList([
            "7:00 → It's seven o'clock",
            "8:30 → It's half past eight",
            "9:15 → It's quarter past nine",
            "10:45 → It's quarter to eleven",
          ]),
        ],
      },
      5
    ),
    // 6. Question
    buildQuestion(
      [
        sq({
          order: 0,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 40,
          questionText: "How do you say 2:30 in English?",
          options: [
            "Quarter past two",
            "Half past two",
            "Quarter to two",
            "Two thirty-two",
          ],
          correctAnswer: "Half past two",
          explanation: "2:30 is 'half past two' because it's 30 minutes past 2 o'clock.",
        }),
        sq({
          order: 1,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 30,
          questionText: "What time is 'quarter to six'?",
          options: ["5:45", "6:15", "5:15", "6:45"],
          correctAnswer: "5:45",
          explanation: "Quarter to six means 15 minutes before 6 o'clock, which is 5:45.",
        }),
        sq({
          order: 2,
          skill: QuestionSkill.WRITING,
          format: QuestionFormat.ESSAY,
          weightPercent: 30,
          questionText: "Describe your daily schedule using time expressions. What do you do at different times of the day? Write 4-5 sentences.",
          essayRubric: "Check for: time expressions used (o'clock, half past, etc.), daily activities mentioned, complete sentences.",
        }),
      ],
      6
    ),
    // 7. Material
    buildMaterial(
      {
        title: "Review: Daily Life Vocabulary",
        contentNodes: [
          heading(2, "Review: Daily Life"),
          p("Great job! Let's review what we've learned about daily life."),
          heading(3, "Vocabulary Recap"),
          bulletList([
            "Daily routines: wake up, brush teeth, eat breakfast, go to school",
            "Foods: rice, bread, chicken, fish, eggs, vegetables, fruit",
            "Drinks: water, milk, juice, tea, coffee",
            "Time: o'clock, half past, quarter past, quarter to",
          ]),
          heading(3, "Practice Conversation"),
        p(`${italicTag("A:")} What time do you wake up?`),
        p(`${italicTag("B:")} I wake up at 6 o'clock.`),
        p(`${italicTag("A:")} What do you eat for breakfast?`),
        p(`${italicTag("B:")} I eat bread and drink milk.`),
          p("Practice this conversation with a partner. Try changing the details to match your own routine!"),
        ],
      },
      7
    ),
    // 8. Question (final comprehensive)
    buildQuestion(
      [
        sq({
          order: 0,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 25,
          questionText: "What time is 8:30?",
          options: [
            "Quarter past eight",
            "Half past eight",
            "Quarter to nine",
            "Eight thirty-two",
          ],
          correctAnswer: "Half past eight",
          explanation: "8:30 is half past eight.",
        }),
        sq({
          order: 1,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 25,
          questionText: "Which drink is good for strong bones?",
          options: ["Water", "Juice", "Milk", "Coffee"],
          correctAnswer: "Milk",
          explanation: "Milk is rich in calcium which is good for strong bones.",
        }),
        sq({
          order: 2,
          skill: QuestionSkill.READING,
          format: QuestionFormat.YES_NO,
          weightPercent: 25,
          questionText: "Do you brush your teeth after eating breakfast?",
          options: ["Yes", "No"],
          correctAnswer: "Yes",
          explanation: "Brushing teeth after breakfast helps maintain good dental hygiene.",
        }),
        sq({
          order: 3,
          skill: QuestionSkill.SPEAKING,
          format: QuestionFormat.SPEECH_RECOGNITION,
          weightPercent: 25,
          questionText: "Say 'I eat breakfast at seven o'clock' into the microphone.",
          expectedSpeech: "I eat breakfast at seven o'clock",
        }),
      ],
      8
    ),
  ];
}

// ─── INTERMEDIATE level content ────────────────────────────────────────

function talkingAboutThePast() {
  return [
    buildMaterial(
      {
        title: "Simple Past Tense",
        contentNodes: [
          heading(2, "Simple Past Tense"),
          p("The simple past tense is used to talk about actions that happened and finished in the past."),
          heading(3, "Forming the Simple Past"),
          p(`For regular verbs, add ${italicTag("-ed")} to the base form:`),
          bulletList([
            "walk → walked",
            "play → played",
            "watch → watched",
            "study → studied",
          ]),
          heading(3, "Irregular Verbs"),
          p("Many common verbs are irregular. You need to memorize their past forms:"),
          bulletList([
            "go → went",
            "eat → ate",
            "see → saw",
            "have → had",
            "do → did",
            "make → made",
          ]),
          heading(3, "Example Sentences"),
          p("I walked to school yesterday."),
          p("She ate breakfast at 7 AM."),
          p("They went to the beach last weekend."),
          p("We watched a movie last night."),
        ],
      },
      1
    ),
    buildQuestion(
      [
        sq({
          order: 0,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 35,
          questionText: "What is the past tense of 'go'?",
          options: ["goed", "went", "gone", "going"],
          correctAnswer: "went",
          explanation: "'Go' is an irregular verb. Its past tense is 'went'.",
        }),
        sq({
          order: 1,
          skill: QuestionSkill.READING,
          format: QuestionFormat.YES_NO,
          weightPercent: 30,
          questionText: "Is 'walked' the correct past tense of 'walk'?",
          options: ["Yes", "No"],
          correctAnswer: "Yes",
          explanation: "Yes, 'walk' is a regular verb so we add -ed to form 'walked'.",
        }),
        sq({
          order: 2,
          skill: QuestionSkill.WRITING,
          format: QuestionFormat.ESSAY,
          weightPercent: 35,
          questionText: "Write 3 sentences about what you did yesterday. Use at least one irregular verb.",
          essayRubric: "Check for: past tense used correctly, at least 3 sentences, at least one irregular verb.",
        }),
      ],
      2
    ),
    buildMaterial(
      {
        title: "Past Continuous Tense",
        contentNodes: [
          heading(2, "Past Continuous Tense"),
          p("The past continuous tense describes an action that was in progress at a specific time in the past."),
          heading(3, "Formation"),
          p("Subject + was/were + verb-ing"),
          bulletList([
            "I was reading at 8 PM.",
            "She was cooking dinner.",
            "They were playing football.",
            "We were watching TV.",
          ]),
          heading(3, "When to Use Past Continuous"),
          p("Use it for actions interrupted by another action:"),
          p("I was reading when the phone rang."),
          p("She was walking home when it started to rain."),
          heading(3, "Simple Past vs Past Continuous"),
          p("Simple past = completed action. Past continuous = ongoing action."),
          p(`${italicTag("I ate dinner.")} (finished) vs ${italicTag("I was eating dinner.")} (in progress)`),
        ],
      },
      3
    ),
    buildQuestion(
      [
        sq({
          order: 0,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 40,
          questionText: "Which sentence uses the past continuous tense?",
          options: [
            "She walked to school.",
            "She was walking to school.",
            "She walks to school.",
            "She will walk to school.",
          ],
          correctAnswer: "She was walking to school.",
          explanation: "'Was walking' is past continuous (was/were + verb-ing).",
        }),
        sq({
          order: 1,
          skill: QuestionSkill.SPEAKING,
          format: QuestionFormat.SPEECH_RECOGNITION,
          weightPercent: 30,
          questionText: "Say 'I was reading a book' into the microphone.",
          expectedSpeech: "I was reading a book",
        }),
        sq({
          order: 2,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 30,
          questionText: "What tense is used for an action that was in progress at a specific past time?",
          options: ["Simple past", "Past continuous", "Present tense", "Future tense"],
          correctAnswer: "Past continuous",
          explanation: "Past continuous describes an ongoing action at a specific past time.",
        }),
      ],
      4
    ),
    buildMaterial(
      {
        title: "Time Expressions for the Past",
        contentNodes: [
          heading(2, "Time Expressions for the Past"),
          p("Certain words and phrases are commonly used with past tenses:"),
          heading(3, "Common Time Expressions"),
          bulletList([
            `${italicTag("Yesterday")} — I went to the park yesterday.`,
            `${italicTag("Last...")} — I saw her last week / last month / last year.`,
            `${italicTag("...ago")} — I moved here two years ago.`,
            `${italicTag("In + year")} — I graduated in 2020.`,
            `${italicTag("When")} — I was sleeping when you called.`,
            `${italicTag("While")} — While I was cooking, he arrived.`,
          ]),
          heading(3, "Practice"),
          p("Try making sentences using each time expression. This will help you remember which tenses to use with which expressions."),
        ],
      },
      5
    ),
    buildQuestion(
      [
        sq({
          order: 0,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 40,
          questionText: "Which time expression is correct with simple past?",
          options: ["Yesterday I go to school", "Yesterday I went to school", "Yesterday I will go to school", "Yesterday I am going to school"],
          correctAnswer: "Yesterday I went to school",
          explanation: "'Yesterday' is a past time marker, so we use the past tense 'went'.",
        }),
        sq({
          order: 1,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 30,
          questionText: "Which word pairs well with past continuous?",
          options: ["Tomorrow", "While", "Next week", "Soon"],
          correctAnswer: "While",
          explanation: "'While' is often used with past continuous to show two simultaneous actions.",
        }),
        sq({
          order: 2,
          skill: QuestionSkill.READING,
          format: QuestionFormat.YES_NO,
          weightPercent: 30,
          questionText: "Is 'two years ago' a correct time expression for past tense?",
          options: ["Yes", "No"],
          correctAnswer: "Yes",
          explanation: "Yes, '...ago' refers to a specific past time and is used with past tense.",
        }),
      ],
      6
    ),
  ];
}

function futurePlans() {
  return [
    buildMaterial(
      {
        title: "Talking About the Future with 'Will'",
        contentNodes: [
          heading(2, "Talking About the Future with 'Will'"),
          p("We use 'will' to talk about future actions, promises, and predictions."),
          heading(3, "Formation"),
          p("Subject + will + base verb"),
          bulletList([
            "I will call you tomorrow.",
            "She will arrive at 5 PM.",
            "They will help us.",
            "It will rain later.",
          ]),
          heading(3, "Negative Form"),
          p("Subject + will not (won't) + base verb"),
          bulletList([
            "I will not (won't) be late.",
            "She won't come to the party.",
            "They won't agree.",
          ]),
          heading(3, "When to Use 'Will'"),
          bulletList([
            "Predictions: I think it will rain.",
            "Promises: I will help you.",
            "Spontaneous decisions: I'll answer the phone!",
            "Offers: I'll carry your bag.",
          ]),
        ],
      },
      1
    ),
    buildQuestion(
      [
        sq({
          order: 0,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 35,
          questionText: "Which sentence uses 'will' for a promise?",
          options: [
            "It will rain tomorrow.",
            "I will help you with your homework.",
            "She will be 15 next month.",
            "The sun will rise at 6 AM.",
          ],
          correctAnswer: "I will help you with your homework.",
          explanation: "'I will help you' is a promise or offer of help.",
        }),
        sq({
          order: 1,
          skill: QuestionSkill.READING,
          format: QuestionFormat.YES_NO,
          weightPercent: 30,
          questionText: "Is 'won't' the contraction of 'will not'?",
          options: ["Yes", "No"],
          correctAnswer: "Yes",
          explanation: "Yes, 'won't' is the standard contraction of 'will not'.",
        }),
        sq({
          order: 2,
          skill: QuestionSkill.SPEAKING,
          format: QuestionFormat.SPEECH_RECOGNITION,
          weightPercent: 35,
          questionText: "Say 'I will call you tomorrow' into the microphone.",
          expectedSpeech: "I will call you tomorrow",
        }),
      ],
      2
    ),
    buildMaterial(
      {
        title: "'Going To' for Future Plans",
        contentNodes: [
          heading(2, "Using 'Going To' for Future Plans"),
          p("We use 'going to' to talk about planned future actions and predictions based on evidence."),
          heading(3, "Formation"),
          p("Subject + am/is/are + going to + base verb"),
          bulletList([
            "I am going to study medicine.",
            "She is going to travel to Japan.",
            "They are going to buy a house.",
          ]),
          heading(3, "'Will' vs 'Going To'"),
          p("Use 'going to' for planned intentions. Use 'will' for spontaneous decisions."),
          bulletList([
            "I'm going to visit my grandma this weekend. (planned)",
            "I'll open the window. (spontaneous)",
          ]),
          heading(3, "Predictions with Evidence"),
          p("Use 'going to' when you can see something coming:"),
          p("Look at those clouds! It's going to rain."),
          p("She's going to win the race — she's very fast!"),
        ],
      },
      3
    ),
    buildQuestion(
      [
        sq({
          order: 0,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 35,
          questionText: "Which sentence describes a planned future intention?",
          options: [
            "I'll help you.",
            "I am going to study law next year.",
            "The phone is ringing - I'll get it.",
            "I think it will rain.",
          ],
          correctAnswer: "I am going to study law next year.",
          explanation: "'Going to' is used for planned intentions. Studying law next year is a plan.",
        }),
        sq({
          order: 1,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 35,
          questionText: "What is the correct form of 'going to' for 'She'?",
          options: ["She are going to", "She is going to", "She am going to", "She be going to"],
          correctAnswer: "She is going to",
          explanation: "'She' uses 'is' as the auxiliary verb: 'She is going to...'.",
        }),
        sq({
          order: 2,
          skill: QuestionSkill.WRITING,
          format: QuestionFormat.ESSAY,
          weightPercent: 30,
          questionText: "Write about your future plans. What are you going to do next year? Write 4-5 sentences using 'going to'.",
          essayRubric: "Check for: 'going to' used correctly, future plans described, 4-5 sentences.",
        }),
      ],
      4
    ),
    buildMaterial(
      {
        title: "Present Continuous for Future Arrangements",
        contentNodes: [
          heading(2, "Present Continuous for Future Arrangements"),
          p("We can use the present continuous tense to talk about fixed future arrangements."),
          heading(3, "Formation"),
          p("Subject + am/is/are + verb-ing + future time expression"),
          bulletList([
            "I am meeting my friend tomorrow.",
            "She is flying to Paris next week.",
            "We are having dinner at 7 PM.",
            "They are moving to a new house in June.",
          ]),
          heading(3, "Three Ways to Talk About the Future"),
          bulletList([
            `${italicTag("Will")} — Predictions, promises, spontaneous decisions`,
            `${italicTag("Going to")} — Planned intentions, evidence-based predictions`,
            `${italicTag("Present continuous")} — Fixed arrangements, appointments`,
          ]),
          p("Choose the correct form based on how certain and planned the future event is!"),
        ],
      },
      5
    ),
    buildQuestion(
      [
        sq({
          order: 0,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 40,
          questionText: "Which sentence uses present continuous for a fixed future arrangement?",
          options: [
            "I will go to the gym.",
            "I am going to start a business.",
            "I am seeing the dentist tomorrow at 3 PM.",
            "I think it will rain.",
          ],
          correctAnswer: "I am seeing the dentist tomorrow at 3 PM.",
          explanation: "'I am seeing the dentist' uses present continuous for a fixed appointment.",
        }),
        sq({
          order: 1,
          skill: QuestionSkill.READING,
          format: QuestionFormat.YES_NO,
          weightPercent: 30,
          questionText: "Can present continuous be used for future arrangements?",
          options: ["Yes", "No"],
          correctAnswer: "Yes",
          explanation: "Yes, present continuous with a future time expression indicates a fixed arrangement.",
        }),
        sq({
          order: 2,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 30,
          questionText: "Which expresses the highest level of certainty?",
          options: ["I will go", "I am going to go", "I am going tomorrow"],
          correctAnswer: "I am going tomorrow",
          explanation: "Present continuous with a specific time expresses the most definite arrangement.",
        }),
      ],
      6
    ),
  ];
}

function describingPeopleAndPlaces() {
  return [
    buildMaterial(
      {
        title: "Descriptive Adjectives",
        contentNodes: [
          heading(2, "Descriptive Adjectives"),
          p("Adjectives describe nouns. They make your English more vivid and interesting."),
          heading(3, "Adjective Order"),
          p("In English, adjectives follow a specific order:"),
          p("Opinion → Size → Age → Shape → Color → Origin → Material → Purpose + Noun"),
          bulletList([
            "A beautiful young woman",
            "A large round wooden table",
            "An interesting old French film",
            "A small black leather bag",
          ]),
          heading(3, "Describing People"),
          bulletList([
            "Appearance: tall, short, slim, curly hair, blue eyes",
            "Personality: friendly, shy, generous, honest, funny",
            "Age: young, elderly, middle-aged",
          ]),
          heading(3, "Describing Places"),
          bulletList([
            "Size: vast, tiny, spacious, cramped",
            "Atmosphere: peaceful, lively, bustling, serene",
            "Appearance: beautiful, stunning, picturesque, dull",
          ]),
        ],
      },
      1
    ),
    buildQuestion(
      [
        sq({
          order: 0,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 40,
          questionText: "Which shows the correct adjective order?",
          options: [
            "A red small car",
            "A small red car",
            "A car small red",
            "Red small a car",
          ],
          correctAnswer: "A small red car",
          explanation: "Size (small) comes before color (red) in English adjective order.",
        }),
        sq({
          order: 1,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 30,
          questionText: "Which word describes someone's personality?",
          options: ["Tall", "Friendly", "Curly", "Young"],
          correctAnswer: "Friendly",
          explanation: "'Friendly' describes personality. 'Tall' and 'curly' describe appearance.",
        }),
        sq({
          order: 2,
          skill: QuestionSkill.READING,
          format: QuestionFormat.YES_NO,
          weightPercent: 30,
          questionText: "Is 'bustling' a good word to describe a peaceful garden?",
          options: ["Yes", "No"],
          correctAnswer: "No",
          explanation: "'Bustling' means full of activity, which is the opposite of peaceful.",
        }),
      ],
      2
    ),
    buildMaterial(
      {
        title: "Relative Clauses",
        contentNodes: [
          heading(2, "Relative Clauses"),
          p("Relative clauses add extra information about a person or thing."),
          heading(3, "Who, Which, That, Where"),
          bulletList([
            `${italicTag("Who")} — for people: The woman who lives next door is a doctor.`,
            `${italicTag("Which")} — for things: The book which I read was amazing.`,
            `${italicTag("That")} — for people or things: The movie that we watched was great.`,
            `${italicTag("Where")} — for places: The restaurant where we ate was fantastic.`,
          ]),
          heading(3, "Defining vs Non-defining"),
          p("Defining clauses are essential to identify the noun:"),
          p("The man who helped me was very kind. (which man? the one who helped)"),
          p("Non-defining clauses add extra info, with commas:"),
          p("My mother, who is a teacher, loves reading. (extra info about my mother)"),
        ],
      },
      3
    ),
    buildQuestion(
      [
        sq({
          order: 0,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 35,
          questionText: "Which relative pronoun is used for places?",
          options: ["Who", "Which", "Where", "Whom"],
          correctAnswer: "Where",
          explanation: "'Where' is used for places: 'the city where I was born'.",
        }),
        sq({
          order: 1,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 35,
          questionText: "Complete: 'The girl ____ won the contest is my sister.'",
          options: ["Which", "Who", "Where", "Whose"],
          correctAnswer: "Who",
          explanation: "'Who' is used for people: 'the girl who won the contest'.",
        }),
        sq({
          order: 2,
          skill: QuestionSkill.WRITING,
          format: QuestionFormat.ESSAY,
          weightPercent: 30,
          questionText: "Describe your favorite place using at least one relative clause. For example: 'The park where I go every weekend is beautiful.' Write 3-4 sentences.",
          essayRubric: "Check for: relative clause used (who/which/that/where), place described, 3-4 complete sentences.",
        }),
      ],
      4
    ),
    buildMaterial(
      {
        title: "Prepositions of Place",
        contentNodes: [
          heading(2, "Prepositions of Place"),
          p("Prepositions tell us where something is located."),
          heading(3, "Common Prepositions"),
          bulletList([
            `${italicTag("In")} — inside an area: The book is in my bag.`,
            `${italicTag("On")} — on a surface: The cup is on the table.`,
            `${italicTag("At")} — a specific point: She is at the bus stop.`,
            `${italicTag("Under")} — below something: The cat is under the chair.`,
            `${italicTag("Between")} — in the middle: The bank is between the library and the park.`,
            `${italicTag("Next to")} — beside: I sit next to my friend.`,
          ]),
          heading(3, "Practice"),
          p("Look around your room. Describe where things are using these prepositions."),
        ],
      },
      5
    ),
    buildQuestion(
      [
        sq({
          order: 0,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 35,
          questionText: "Which preposition means 'on a surface'?",
          options: ["In", "On", "At", "Under"],
          correctAnswer: "On",
          explanation: "'On' is used when something is on a surface, like 'on the table'.",
        }),
        sq({
          order: 1,
          skill: QuestionSkill.READING,
          format: QuestionFormat.YES_NO,
          weightPercent: 30,
          questionText: "Is the preposition 'between' used for two things or more?",
          options: ["Yes, two things", "No, many things"],
          correctAnswer: "Yes, two things",
          explanation: "'Between' is used when something is in the middle of two things.",
        }),
        sq({
          order: 2,
          skill: QuestionSkill.SPEAKING,
          format: QuestionFormat.SPEECH_RECOGNITION,
          weightPercent: 35,
          questionText: "Say 'The book is on the table' into the microphone.",
          expectedSpeech: "The book is on the table",
        }),
      ],
      6
    ),
  ];
}

// ─── HARD level content ────────────────────────────────────────────────

function conditionalsAndHypotheticals() {
  return [
    buildMaterial(
      {
        title: "Zero and First Conditionals",
        contentNodes: [
          heading(2, "Zero and First Conditionals"),
          p("Conditional sentences express that one thing depends on another."),
          heading(3, "Zero Conditional — General Truths"),
          p("If + present simple, → present simple"),
          bulletList([
            "If you heat water to 100°C, it boils.",
            "If it rains, the ground gets wet.",
            "If I'm tired, I go to bed early.",
          ]),
          heading(3, "First Conditional — Real Future"),
          p("If + present simple, → will + base verb"),
          bulletList([
            "If it rains tomorrow, I will stay home.",
            "If you study hard, you will pass the exam.",
            "She will be happy if you call her.",
          ]),
          p("The first conditional describes a real possibility in the future."),
        ],
      },
      1
    ),
    buildQuestion(
      [
        sq({
          order: 0,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 35,
          questionText: "Complete: 'If you freeze water, it ____.'",
          options: ["will turn to ice", "turns to ice", "would turn to ice", "turned to ice"],
          correctAnswer: "turns to ice",
          explanation: "Zero conditional uses present simple in both clauses for general truths.",
        }),
        sq({
          order: 1,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 35,
          questionText: "Which sentence is a first conditional?",
          options: [
            "If you heat ice, it melts.",
            "If I were rich, I would travel.",
            "If she calls, I will answer.",
            "If I had known, I would have come.",
          ],
          correctAnswer: "If she calls, I will answer.",
          explanation: "First conditional: if + present simple → will + base verb.",
        }),
        sq({
          order: 2,
          skill: QuestionSkill.WRITING,
          format: QuestionFormat.ESSAY,
          weightPercent: 30,
          questionText: "Write 2 zero conditional sentences and 2 first conditional sentences about your daily life.",
          essayRubric: "Check for: correct tense usage, 2 zero conditionals, 2 first conditionals, logical sentences.",
        }),
      ],
      2
    ),
    buildMaterial(
      {
        title: "Second and Third Conditionals",
        contentNodes: [
          heading(2, "Second and Third Conditionals"),
          heading(3, "Second Conditional — Unreal Present/Future"),
          p("If + past simple, → would + base verb"),
          bulletList([
            "If I had more time, I would learn piano.",
            "If I were you, I would accept the offer.",
            "She would travel more if she had more money.",
          ]),
          p("Note: Use 'were' for all subjects in the if-clause (if I were, if he were)."),
          heading(3, "Third Conditional — Unreal Past"),
          p("If + past perfect, → would have + past participle"),
          bulletList([
            "If I had studied harder, I would have passed the exam.",
            "If we had left earlier, we would have caught the train.",
            "She would have been happy if you had invited her.",
          ]),
          p("The third conditional expresses regret about past situations that cannot be changed."),
        ],
      },
      3
    ),
    buildQuestion(
      [
        sq({
          order: 0,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 35,
          questionText: "Complete: 'If I ____ you, I would apologize.'",
          options: ["am", "was", "were", "be"],
          correctAnswer: "were",
          explanation: "Second conditional uses 'were' for all subjects: 'If I were you'.",
        }),
        sq({
          order: 1,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 35,
          questionText: "Which expresses regret about the past?",
          options: [
            "If I study, I will pass.",
            "If I studied, I would pass.",
            "If I had studied, I would have passed.",
            "If I study, I pass.",
          ],
          correctAnswer: "If I had studied, I would have passed.",
          explanation: "Third conditional (if + had + past participle) expresses regret about the past.",
        }),
        sq({
          order: 2,
          skill: QuestionSkill.READING,
          format: QuestionFormat.YES_NO,
          weightPercent: 30,
          questionText: "Does the second conditional describe a real possibility?",
          options: ["Yes", "No"],
          correctAnswer: "No",
          explanation: "The second conditional describes unreal or imaginary situations, not real ones.",
        }),
      ],
      4
    ),
    buildMaterial(
      {
        title: "Wishes and Hypotheticals",
        contentNodes: [
          heading(2, "Wishes and Hypotheticals"),
          p("We use 'wish' to express desires about situations that are different from reality."),
          heading(3, "Wish + Past Simple — Present Wishes"),
          bulletList([
            "I wish I knew the answer.",
            "She wishes she lived closer.",
            "I wish I were taller.",
          ]),
          heading(3, "Wish + Past Perfect — Past Regrets"),
          bulletList([
            "I wish I had studied more.",
            "She wishes she had taken the job.",
            "We wish we had arrived earlier.",
          ]),
          heading(3, "If Only"),
          p("'If only' is a stronger version of 'wish':"),
          bulletList([
            "If only I could fly!",
            "If only I had listened to your advice.",
          ]),
        ],
      },
      5
    ),
    buildQuestion(
      [
        sq({
          order: 0,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 35,
          questionText: "Complete: 'I wish I ____ more time.'",
          options: ["have", "had", "would have", "will have"],
          correctAnswer: "had",
          explanation: "'Wish' + past simple for present desires: 'I wish I had more time'.",
        }),
        sq({
          order: 1,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 35,
          questionText: "Which expresses a past regret?",
          options: [
            "I wish I know the truth.",
            "I wish I knew the truth.",
            "I wish I had known the truth.",
            "I wish I will know the truth.",
          ],
          correctAnswer: "I wish I had known the truth.",
          explanation: "'Wish + had + past participle' expresses regret about the past.",
        }),
        sq({
          order: 2,
          skill: QuestionSkill.SPEAKING,
          format: QuestionFormat.SPEECH_RECOGNITION,
          weightPercent: 30,
          questionText: "Say 'I wish I could travel the world' into the microphone.",
          expectedSpeech: "I wish I could travel the world",
        }),
      ],
      6
    ),
  ];
}

function passiveVoiceAndFormal() {
  return [
    buildMaterial(
      {
        title: "Introduction to Passive Voice",
        contentNodes: [
          heading(2, "Introduction to Passive Voice"),
          p("The passive voice shifts focus from who did the action to the action itself."),
          heading(3, "Active vs Passive"),
          bulletList([
            "Active: The chef cooked the meal.",
            "Passive: The meal was cooked by the chef.",
            "Active: Thousands of people read the book.",
            "Passive: The book was read by thousands.",
          ]),
          heading(3, "Formation"),
          p("Subject + be (conjugated) + past participle + (by agent)"),
          bulletList([
            "Present simple: The room is cleaned every day.",
            "Past simple: The room was cleaned yesterday.",
            "Future: The room will be cleaned tomorrow.",
            "Present perfect: The room has been cleaned.",
          ]),
          heading(3, "When to Use Passive"),
          bulletList([
            "When the agent is unknown: My phone was stolen.",
            "When the action is more important: The vaccine was developed in record time.",
            "In formal or scientific writing: The experiment was conducted three times.",
          ]),
        ],
      },
      1
    ),
    buildQuestion(
      [
        sq({
          order: 0,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 35,
          questionText: "Convert to passive: 'Shakespeare wrote Hamlet.'",
          options: [
            "Hamlet wrote Shakespeare.",
            "Hamlet was written by Shakespeare.",
            "Hamlet is written by Shakespeare.",
            "Hamlet has been written by Shakespeare.",
          ],
          correctAnswer: "Hamlet was written by Shakespeare.",
          explanation: "Past simple passive: was/were + past participle.",
        }),
        sq({
          order: 1,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 35,
          questionText: "When is passive voice most appropriate?",
          options: [
            "In casual conversation with friends",
            "When the agent is unknown or unimportant",
            "When describing your hobbies",
            "When giving commands",
          ],
          correctAnswer: "When the agent is unknown or unimportant",
          explanation: "Passive is useful when the doer is unknown (My phone was stolen) or unimportant.",
        }),
        sq({
          order: 2,
          skill: QuestionSkill.WRITING,
          format: QuestionFormat.ESSAY,
          weightPercent: 30,
          questionText: "Rewrite these 3 sentences in passive voice: 1) Someone cleaned the office. 2) The company launched a new product. 3) The students completed the project.",
          essayRubric: "Check for: correct passive formation, past participles used correctly, agent included where appropriate.",
        }),
      ],
      2
    ),
    buildMaterial(
      {
        title: "Formal English Structures",
        contentNodes: [
          heading(2, "Formal English Structures"),
          p("Formal English is used in academic writing, business, and official communication."),
          heading(3, "Formal vs Informal Vocabulary"),
          bulletList([
            "Informal: ask → Formal: inquire",
            "Informal: help → Formal: assist",
            "Informal: start → Formal: commence",
            "Informal: get → Formal: obtain",
            "Informal: show → Formal: demonstrate",
            "Informal: enough → Formal: sufficient",
          ]),
          heading(3, "Formal Sentence Structures"),
          bulletList([
            "Avoid contractions: 'do not' instead of 'don't'",
            "Use passive voice: 'It was decided that...'",
            "Use formal connectors: 'Moreover', 'Furthermore', 'Nevertheless'",
            "Use 'one' instead of 'you': 'One should consider...'",
          ]),
          heading(3, "Example Comparison"),
          p("Informal: We should start the meeting now because everyone is here."),
          p("Formal: The meeting should commence now, as all participants are present."),
        ],
      },
      3
    ),
    buildQuestion(
      [
        sq({
          order: 0,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 40,
          questionText: "Which word is more formal for 'help'?",
          options: ["Aid", "Assist", "Support", "Both A and B"],
          correctAnswer: "Assist",
          explanation: "'Assist' is the most formal equivalent of 'help' in business/academic contexts.",
        }),
        sq({
          order: 1,
          skill: QuestionSkill.READING,
          format: QuestionFormat.YES_NO,
          weightPercent: 30,
          questionText: "Should you use contractions in formal writing?",
          options: ["Yes", "No"],
          correctAnswer: "No",
          explanation: "Contractions like 'don't' and 'can't' are avoided in formal writing.",
        }),
        sq({
          order: 2,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 30,
          questionText: "Which connector is formal?",
          options: ["And", "But", "Moreover", "So"],
          correctAnswer: "Moreover",
          explanation: "'Moreover' is a formal connector. 'And', 'but', and 'so' are more informal.",
        }),
      ],
      4
    ),
    buildMaterial(
      {
        title: "Reported Speech",
        contentNodes: [
          heading(2, "Reported Speech"),
          p("Reported speech is used to tell someone what another person said, without quoting them directly."),
          heading(3, "Direct vs Reported"),
          bulletList([
            "Direct: She said, 'I am tired.'",
            "Reported: She said that she was tired.",
            "Direct: He said, 'I will call you.'",
            "Reported: He said that he would call me.",
          ]),
          heading(3, "Tense Changes in Reported Speech"),
          bulletList([
            "Present → Past: 'I like it' → He said he liked it.",
            "Will → Would: 'I will go' → She said she would go.",
            "Present perfect → Past perfect: 'I have seen it' → He said he had seen it.",
            "Past → Past perfect: 'I saw it' → She said she had seen it.",
          ]),
          heading(3, "Questions in Reported Speech"),
          p("Yes/No questions use 'if' or 'whether':"),
          p("'Are you coming?' → She asked if I was coming."),
        ],
      },
      5
    ),
    buildQuestion(
      [
        sq({
          order: 0,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 35,
          questionText: "Report: 'I am happy', she said.",
          options: [
            "She said she is happy.",
            "She said she was happy.",
            "She said she has been happy.",
            "She said she will be happy.",
          ],
          correctAnswer: "She said she was happy.",
          explanation: "In reported speech, present tense shifts to past tense.",
        }),
        sq({
          order: 1,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 35,
          questionText: "How do you report a yes/no question?",
          options: ["Use 'that'", "Use 'if' or 'whether'", "Use 'what'", "Use 'why'"],
          correctAnswer: "Use 'if' or 'whether'",
          explanation: "Yes/no questions in reported speech use 'if' or 'whether'.",
        }),
        sq({
          order: 2,
          skill: QuestionSkill.READING,
          format: QuestionFormat.YES_NO,
          weightPercent: 30,
          questionText: "Does 'will' become 'would' in reported speech?",
          options: ["Yes", "No"],
          correctAnswer: "Yes",
          explanation: "Yes, 'will' shifts back to 'would' in reported speech.",
        }),
      ],
      6
    ),
  ];
}

function expressingOpinions() {
  return [
    buildMaterial(
      {
        title: "Giving Opinions",
        contentNodes: [
          heading(2, "Giving Opinions Politely"),
          p("In discussions and debates, it's important to express opinions politely and clearly."),
          heading(3, "Useful Phrases for Giving Opinions"),
          bulletList([
            `${italicTag("In my opinion...")} — In my opinion, the government should invest more in education.`,
            `${italicTag("I believe that...")} — I believe that climate change is the biggest challenge.`,
            `${italicTag("It seems to me that...")} — It seems to me that we need a different approach.`,
            `${italicTag("From my perspective...")} — From my perspective, this solution has some flaws.`,
            `${italicTag("I would argue that...")} — I would argue that we need more research first.`,
          ]),
          heading(3, "Agreeing and Disagreeing"),
          p("Agreeing:"),
          bulletList([
            "I completely agree.",
            "That's a good point.",
            "I couldn't agree more.",
            "You're absolutely right.",
          ]),
          p("Disagreeing politely:"),
          bulletList([
            "I see your point, but...",
            "I respectfully disagree.",
            "That's one way to look at it, however...",
            "I'm not sure I agree with that.",
          ]),
        ],
      },
      1
    ),
    buildQuestion(
      [
        sq({
          order: 0,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 35,
          questionText: "Which phrase is most polite for disagreeing?",
          options: [
            "You're wrong.",
            "That's not true.",
            "I see your point, but I think differently.",
            "No, you're mistaken.",
          ],
          correctAnswer: "I see your point, but I think differently.",
          explanation: "Politely acknowledging the other person's view before presenting your own.",
        }),
        sq({
          order: 1,
          skill: QuestionSkill.READING,
          format: QuestionFormat.YES_NO,
          weightPercent: 30,
          questionText: "Is 'I couldn't agree more' a phrase meaning you agree strongly?",
          options: ["Yes", "No"],
          correctAnswer: "Yes",
          explanation: "'I couldn't agree more' means you agree completely.",
        }),
        sq({
          order: 2,
          skill: QuestionSkill.SPEAKING,
          format: QuestionFormat.SPEECH_RECOGNITION,
          weightPercent: 35,
          questionText: "Say 'In my opinion, education is very important' into the microphone.",
          expectedSpeech: "In my opinion education is very important",
        }),
      ],
      2
    ),
    buildMaterial(
      {
        title: "Structuring Arguments",
        contentNodes: [
          heading(2, "Structuring Arguments"),
          p("A well-structured argument makes your opinion more convincing."),
          heading(3, "The PEEL Method"),
          bulletList([
            `${italicTag("P")} — Point: State your main idea clearly.`,
            `${italicTag("E")} — Evidence: Provide facts, examples, or data.`,
            `${italicTag("E")} — Explanation: Explain how the evidence supports your point.`,
            `${italicTag("L")} — Link: Connect back to the main topic or question.`,
          ]),
          heading(3, "Example"),
          p("Point: Recycling should be mandatory in all cities."),
          p("Evidence: Studies show that mandatory recycling reduces waste by up to 40%."),
          p("Explanation: This significant reduction would help combat pollution and save natural resources."),
          p("Link: Therefore, making recycling mandatory is a crucial step toward a sustainable future."),
          heading(3, "Connecting Ideas"),
          p("Use linking words to flow between ideas:"),
          bulletList([
            "Adding: Furthermore, Moreover, In addition",
            "Contrast: However, On the other hand, Nevertheless",
            "Cause/Effect: Therefore, Consequently, As a result",
            "Conclusion: In conclusion, To summarize, Ultimately",
          ]),
        ],
      },
      3
    ),
    buildQuestion(
      [
        sq({
          order: 0,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 35,
          questionText: "In the PEEL method, what does the 'P' stand for?",
          options: ["Proof", "Point", "Persuade", "Present"],
          correctAnswer: "Point",
          explanation: "The P in PEEL stands for 'Point' — stating your main idea.",
        }),
        sq({
          order: 1,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 35,
          questionText: "Which linking word shows contrast?",
          options: ["Furthermore", "Moreover", "However", "Therefore"],
          correctAnswer: "However",
          explanation: "'However' is used to introduce a contrasting idea.",
        }),
        sq({
          order: 2,
          skill: QuestionSkill.WRITING,
          format: QuestionFormat.ESSAY,
          weightPercent: 30,
          questionText: "Write a short argument about whether students should have homework. Use the PEEL structure and at least two linking words.",
          essayRubric: "Check for: PEEL structure (Point, Evidence, Explanation, Link), at least 2 linking words, clear position, 4-6 sentences.",
        }),
      ],
      4
    ),
    buildMaterial(
      {
        title: "Debate and Discussion Skills",
        contentNodes: [
          heading(2, "Debate and Discussion Skills"),
          p("Debates require quick thinking, clear arguments, and respectful communication."),
          heading(3, "Opening a Debate"),
          bulletList([
            "Today we are debating whether...",
            "I'd like to begin by stating that...",
            "My team firmly believes that...",
          ]),
          heading(3, "Rebuttals"),
          p("Responding to the opposing side:"),
          bulletList([
            "While I understand your point, I would counter that...",
            "Your argument assumes that... but actually...",
            "I would like to challenge that idea because...",
          ]),
          heading(3, "Closing Statements"),
          bulletList([
            "To summarize our main points...",
            "Based on the evidence presented, it is clear that...",
            "I urge you to consider...",
          ]),
          p("Remember: The goal of a debate is not to win at all costs, but to explore ideas and reach a deeper understanding."),
        ],
      },
      5
    ),
    buildQuestion(
      [
        sq({
          order: 0,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 35,
          questionText: "What is a rebuttal in a debate?",
          options: [
            "The opening statement",
            "A response challenging the opposing argument",
            "The closing statement",
            "A question from the audience",
          ],
          correctAnswer: "A response challenging the opposing argument",
          explanation: "A rebuttal is a response that challenges or counters the opposing side's argument.",
        }),
        sq({
          order: 1,
          skill: QuestionSkill.READING,
          format: QuestionFormat.MULTIPLE_CHOICE,
          weightPercent: 35,
          questionText: "Which phrase is appropriate for a rebuttal?",
          options: [
            "In conclusion...",
            "Today we are debating...",
            "I would like to challenge that idea because...",
            "To summarize...",
          ],
          correctAnswer: "I would like to challenge that idea because...",
          explanation: "This phrase respectfully challenges the opposing argument.",
        }),
        sq({
          order: 2,
          skill: QuestionSkill.WRITING,
          format: QuestionFormat.ESSAY,
          weightPercent: 30,
          questionText: "Write a short closing statement for a debate on the topic: 'Social media does more harm than good.' Use formal language and summarize at least two points.",
          essayRubric: "Check for: formal language, 2+ points summarized, persuasive tone, 3-5 sentences.",
        }),
      ],
      6
    ),
  ];
}

import { LevelName } from "@prisma/client";
import type { ContentItem } from "./helpers";

export const LEGACY_GROUP_BUILDERS: Record<
  LevelName,
  Record<string, () => ContentItem[]>
> = {
  [LevelName.BASIC]: {
    "Greetings & Introductions": greetingsAndIntroductions,
    "Numbers & Colors": numbersAndColors,
    "Daily Life": dailyLife,
  },
  [LevelName.INTERMEDIATE]: {
    "Talking About the Past": talkingAboutThePast,
    "Future Plans & Intentions": futurePlans,
    "Describing People & Places": describingPeopleAndPlaces,
  },
  [LevelName.HARD]: {
    "Conditionals & Hypotheticals": conditionalsAndHypotheticals,
    "Passive Voice & Formal English": passiveVoiceAndFormal,
    "Expressing Opinions & Arguments": expressingOpinions,
  },
};
