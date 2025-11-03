import { } from "firebase/auth";
import { API_URL } from "../api";
import { auth } from "./firebase";


export async function createQuiz(quizData: any) {
    const token = await auth.currentUser?.getIdToken();

    const res = await fetch(`${API_URL}/quizzes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            name: quizData.quizName,
            description: quizData.quizDescription,
            subjectId: quizData.subject,
            user_id: quizData.creator,
        }),
    });

    if (!res.ok) throw new Error("Failed to create quiz");
    const data = await res.json();
    let type = -1;
    const questionsArray = Object.values(quizData.questions);
    for (let question of questionsArray) {
        const questionFormData = new FormData();
        questionFormData.append("text", question.question);
        questionFormData.append("quizId", data.id);
        if (question.keywords) {
            type = 0;
            questionFormData.append("questionType", "CUSTOM_ANWSER");
        } else if (question.ans1) {
            type = 1;
            questionFormData.append("questionType", "PRESET_ANWSER");
        } else if (question.questionImage1) {
            type = 2;
            questionFormData.append("questionType", "MEDIA_ANWSER");
        }

        if (question.questionImage) {
            questionFormData.append("file", question.questionImage[0].originFileObj);
        }
        const questionRes = await fetch(`${API_URL}/questions`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: questionFormData,
        });

        if (!questionRes.ok) throw new Error("Failed to create question");
        const questionData = await questionRes.json();
        if (type === 0) {
            const answerFormData = new FormData();
            answerFormData.append("questionId", questionData.id);
            answerFormData.append("text", question.keywords);
            answerFormData.append("isCorrect", "1");

            const ansRes = await fetch(`${API_URL}/answers`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: answerFormData,
            });

            if (!ansRes.ok) throw new Error("Failed to create answer");
            const answerData = await ansRes.json();
        } else if (type === 1) {
            const answerTexts: string[] = [];
            const correctFlags: boolean[] = [false, false, false, false];

            for (let i = 1; i <= 4; i++) {
                const ansText = question[`ans${i}`];
                const correctFlag = Boolean(question[`correctAns${i}`]);
                if (ansText !== undefined && ansText !== null && ansText !== "") {
                    answerTexts.push(ansText);
                    correctFlags[i - 1] = correctFlag;
                }
            }

            if (answerTexts.length < 2) {
                throw new Error("Each question must have at least 2 answers");
            }

            for (let i = 0; i < answerTexts.length; i++) {
                const answerFormData = new FormData();
                answerFormData.append("questionId", String(questionData.id));
                answerFormData.append("text", answerTexts[i]);
                answerFormData.append("isCorrect", correctFlags[i] ? "1" : "0");

                const ansRes = await fetch(`${API_URL}/answers`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: answerFormData,
                });

                if (!ansRes.ok) throw new Error("Failed to create answer");
                const answerData = await ansRes.json();
            }
        } else if (type === 2) {
            const answerImages: string[] = [];
            const correctFlags: boolean[] = [false, false, false, false];

            for (let i = 1; i <= 4; i++) {
                const ansText = question[`questionImage${i}`];
                const correctFlag = Boolean(question[`correctImage${i}`]);
                if (ansText !== undefined && ansText !== null && ansText !== "") {
                    answerImages.push(question[`questionImage${i}`][0].originFileObj);
                    correctFlags[i - 1] = correctFlag;
                }
            }

            if (answerImages.length < 2) {
                throw new Error("Each question must have at least 2 answers");
            }

            for (let i = 0; i < answerImages.length; i++) {
                const answerFormData = new FormData();
                answerFormData.append("questionId", String(questionData.id));
                answerFormData.append("text", "image answer");
                answerFormData.append("file", answerImages[i]);
                answerFormData.append("isCorrect", correctFlags[i] ? "1" : "0");

                const ansRes = await fetch(`${API_URL}/answers`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: answerFormData,
                });

                if (!ansRes.ok) throw new Error("Failed to create answer");
                const answerData = await ansRes.json();
            }
        }
    }
    return data;
}

export async function fetchSubjects() {
    const token = await auth.currentUser?.getIdToken();

    const res = await fetch(`${API_URL}/subjects`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) throw new Error("Failed to fetch subjects");
    const data = await res.json();
    return data;
}

export async function fetchQuizzes() {
    const res = await fetch(`${API_URL}/quizzes`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) throw new Error("Failed to fetch quizzes");
    const data = await res.json();
    return data;
}

export async function createSubject(subjectName: string) {
    const token = await auth.currentUser?.getIdToken();

    const res = await fetch(`${API_URL}/subjects`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: subjectName }),
    });

    if (!res.ok) throw new Error("Failed to create subject");
    const data = await res.json();
    return data;
}

export async function deleteQuiz(quizId: string) {
    const token = await auth.currentUser?.getIdToken();

    const res = await fetch(`${API_URL}/quizzes/${quizId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) throw new Error("Failed to delete quiz");
    const data = await res.json();
    return data;
}   