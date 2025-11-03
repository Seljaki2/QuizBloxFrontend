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
    
    const questionsArray = Object.values(quizData.questions);
    
    // Process all questions in parallel
    await Promise.all(questionsArray.map(async (question: any) => {
        let type = -1;
        const questionFormData = new FormData();
        questionFormData.append("text", question.question);
        questionFormData.append("quizId", data.id);
        
        if (question.keywords) {
            type = 0;
        } else if (question.ans1) {
            type = 1;
        } else if (question.questionImage1) {
            type = 2;
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
        
        // Create answers based on type
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

            // Create all answers for this question in parallel
            await Promise.all(answerTexts.map(async (ansText, i) => {
                const answerFormData = new FormData();
                answerFormData.append("questionId", String(questionData.id));
                answerFormData.append("text", ansText);
                answerFormData.append("isCorrect", correctFlags[i] ? "1" : "0");

                const ansRes = await fetch(`${API_URL}/answers`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: answerFormData,
                });

                if (!ansRes.ok) throw new Error("Failed to create answer");
            }));
        } else if (type === 2) {
            const answerImages: any[] = [];
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

            // Create all answers for this question in parallel
            await Promise.all(answerImages.map(async (image, i) => {
                const answerFormData = new FormData();
                answerFormData.append("questionId", String(questionData.id));
                answerFormData.append("text", "image answer");
                answerFormData.append("file", image);
                answerFormData.append("isCorrect", correctFlags[i] ? "1" : "0");

                const ansRes = await fetch(`${API_URL}/answers`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: answerFormData,
                });

                if (!ansRes.ok) throw new Error("Failed to create answer");
            }));
        }
    }));
    
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