import { useContext, useEffect, useState } from 'react';
import { Button, Card, Flex, Form, Image } from 'antd';
import styles from './QuizAnswering.module.css';
import TextArea from 'antd/es/input/TextArea';
import { closeSocket, socket } from '../../fetch/socketio';
import { clearSession, gamerSessionId, guestUsername, questionIndex, session, users } from '../../fetch/GAMINGSESSION';
import type { Answer, AppUser, GuestUser } from '../../fetch/types';
import { PICTURE_URL } from '../../api';
import { useNavigate } from "react-router-dom";
import { UserContext } from '../../context/UserContext.tsx';

export default function QuizAnswering() {
  const navigate = useNavigate();
  const colorClasses = [styles.blue, styles.pink, styles.orange, styles.green];
  const [isQuizOver, setIsQuizOver] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null | string>(null);
  const [userInput, setUserInput] = useState('null');
  const [waiting, setWaiting] = useState(false);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [questionIndexState, setQuestionIndexState] = useState(questionIndex);
  const [usersState, setUsersState] = useState(users);
  const [average, setAverage] = useState(0);
  const [userState, setUserState] = useState<number>(-1);
  const { user } = useContext(UserContext);

  const createEmptyBoard = (): boolean[][] => {
    const board = Array.from({ length: 5 }, () => Array(5).fill(false));
    board[2][2] = true;
    return board;
  };
  const [bingoBoard, setBingoBoard] = useState<boolean[][]>(createEmptyBoard);

  const [assignedAxis, setAssignedAxis] = useState<{ axis: 'row' | 'col'; index: number } | null>(null);
  const [selectedTile, setSelectedTile] = useState<{ r: number; c: number } | null>(null);
  const [canSelectTile, setCanSelectTile] = useState(false);
  const [bingoBonus, setBingoBonus] = useState(0);
  const [hasBingo, setHasBingo] = useState(false);
  const [completedLines, setCompletedLines] = useState<Set<string>>(new Set());
  const [finalBingoBonus, setFinalBingoBonus] = useState(0);

  const checkBingo = (board: boolean[][]): boolean => {
    for (let r = 0; r < 5; r++) {
      if (board[r].every(cell => cell)) return true;
    }
    for (let c = 0; c < 5; c++) {
      if (board.every(row => row[c])) return true;
    }
    const diag1 = [0, 1, 2, 3, 4].every(i => board[i][i]);
    const diag2 = [0, 1, 2, 3, 4].every(i => board[i][4 - i]);
    return diag1 || diag2;
  };


  const getUserIndex = () => {
    const index = usersState.findIndex(u =>
      guestUsername
        ? ('guestUsername' in u ? u.guestUsername === guestUsername : false)
        : ('username' in u ? u.username === user.username : false)
    );

    setUserState(index);
  };


  const assignTileForQuestion = () => {
    const axis = Math.random() < 0.5 ? 'row' : 'col';
    const index = Math.floor(Math.random() * 5);
    setAssignedAxis({ axis, index });

    const candidates: { r: number; c: number }[] = [];
    for (let i = 0; i < 5; i++) {
      const r = axis === 'row' ? index : i;
      const c = axis === 'col' ? index : i;
      if (!bingoBoard[r][c]) candidates.push({ r, c });
    }

    if (candidates.length === 0) {
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (!bingoBoard[r][c]) candidates.push({ r, c });
        }
      }
    }

    if (candidates.length > 0) {
      const choice = candidates[Math.floor(Math.random() * candidates.length)];
      setSelectedTile(choice);
    }
    setCanSelectTile(true);
  };

  const handleTileClick = (r: number, c: number) => {
    if (!canSelectTile || bingoBoard[r][c]) return;

    if (assignedAxis) {
      const { axis, index } = assignedAxis;
      const inAssigned = (axis === 'row' && r === index) || (axis === 'col' && c === index);

      let hasFreeCellsInAxis = false;
      for (let i = 0; i < 5; i++) {
        const checkR = axis === 'row' ? index : i;
        const checkC = axis === 'col' ? index : i;
        if (!bingoBoard[checkR][checkC]) {
          hasFreeCellsInAxis = true;
          break;
        }
      }

      if (!inAssigned && hasFreeCellsInAxis) return;
    }

    setSelectedTile({ r, c });
  };

  const markSelectedBingoCell = (applyBonusNow: boolean = true) => {
    if (!selectedTile) return;

    setBingoBoard(prevBoard => {
      const newBoard = prevBoard.map(row => [...row]);
      newBoard[selectedTile.r][selectedTile.c] = true;

      // detect newly completed full rows/columns
      const newlyCompleted: string[] = [];
      for (let r = 0; r < 5; r++) {
        if (newBoard[r].every(cell => cell) && !completedLines.has(`r${r}`)) newlyCompleted.push(`r${r}`);
      }
      for (let c = 0; c < 5; c++) {
        let all = true;
        for (let r = 0; r < 5; r++) if (!newBoard[r][c]) { all = false; break; }
        if (all && !completedLines.has(`c${c}`)) newlyCompleted.push(`c${c}`);
      }

      if (newlyCompleted.length > 0) {
        setCompletedLines(prev => {
          const next = new Set(prev);
          newlyCompleted.forEach(n => next.add(n));
          return next;
        });

        // progressive bonus: first line = 100, second = 200, etc.
        const existing = completedLines.size;
        let increment = 0;
        for (let i = 0; i < newlyCompleted.length; i++) {
          increment += 100 * (existing + i + 1);
        }
        if (applyBonusNow) {
          setFinalBingoBonus(prev => prev + increment);
          setBingoBonus(increment);
          setHasBingo(true);
        }
      }

      return newBoard;
    });

    setCanSelectTile(false);
    setAssignedAxis(null);
    setSelectedTile(null);
  };

  const computeIncrement = (willMark: boolean, tile: { r: number; c: number } | null) => {
    const board = bingoBoard.map(row => [...row]);
    const completed = new Set(completedLines);
    let increment = 0;

    if (willMark && tile && !board[tile.r][tile.c]) {
      board[tile.r][tile.c] = true;

      const newlyCompleted: string[] = [];
      for (let r = 0; r < 5; r++) {
        if (board[r].every(cell => cell) && !completed.has(`r${r}`)) newlyCompleted.push(`r${r}`);
      }
      for (let c = 0; c < 5; c++) {
        let all = true;
        for (let r = 0; r < 5; r++) if (!board[r][c]) { all = false; break; }
        if (all && !completed.has(`c${c}`)) newlyCompleted.push(`c${c}`);
      }

      if (newlyCompleted.length > 0) {
        const existing = completed.size;
        for (let i = 0; i < newlyCompleted.length; i++) {
          increment += 100 * (existing + i + 1);
        }
      }
    }

    const totalQuestions = session?.quiz.questions.length ?? 0;
    if (totalQuestions < 5) {
      // compute longest contiguous filled tiles in any row after marking (if willMark)
      let maxConsecutive = 0;
      for (let r = 0; r < 5; r++) {
        let current = 0;
        for (let c = 0; c < 5; c++) {
          if (board[r][c]) {
            current += 1;
            if (current > maxConsecutive) maxConsecutive = current;
          } else {
            current = 0;
          }
        }
      }
      if (maxConsecutive > 0) {
        increment += maxConsecutive * 25;
      }
    }
    console.log('Computed bingo increment:', increment);
    return increment;
  };

  const isCellSelectable = (r: number, c: number): boolean => {
    if (!canSelectTile || bingoBoard[r][c]) return false;

    if (assignedAxis) {
      const { axis, index } = assignedAxis;
      const inAssigned = (axis === 'row' && r === index) || (axis === 'col' && c === index);

      let hasFreeCellsInAxis = false;
      for (let i = 0; i < 5; i++) {
        const checkR = axis === 'row' ? index : i;
        const checkC = axis === 'col' ? index : i;
        if (!bingoBoard[checkR][checkC]) {
          hasFreeCellsInAxis = true;
          break;
        }
      }

      return inAssigned || !hasFreeCellsInAxis;
    }

    return true;
  };

  const handleAnswer = (answer: Answer, colorClass: string) => {
    setSelectedAnswer(answer);
    setWaiting(true);
    const isCorrect = answer.isCorrect;
    setResult(isCorrect ? 'correct' : 'incorrect');
    const isFinal = questionIndexState >= (session?.quiz.questions.length ?? 0) - 1;
    console.log('isFinal:', isFinal);

    const tile = selectedTile;

    // always mark first when correct
    if (isCorrect) {
      // when final, delay applying bonus in mark function
      markSelectedBingoCell(isFinal ? false : true);
    } else {
      setCanSelectTile(false);
      setAssignedAxis(null);
      setSelectedTile(null);
    }

    if (isFinal) {
      const increment = computeIncrement(isCorrect, tile);
      console.log('Final question bingo increment:', increment);
      if (increment > 0) {
        setFinalBingoBonus(prev => prev + increment);
        setBingoBonus(increment);
        setHasBingo(true);
      }
      sendQuestion(session?.quiz.questions[questionIndexState].id, answer.id, undefined, Date.now(), undefined, increment);
    } else {
      sendQuestion(session?.quiz.questions[questionIndexState].id, answer.id, undefined, Date.now(), undefined, 0);
    }
    setWaiting(false);
  };

  const sendQuestion = (questionId: string, answerId: string | null, userEntry: string | undefined, answerTime: number, isCorrect: string | undefined, bonus?: number) => {
    const payload: any = {
      questionId: questionId,
      answerId: answerId,
      userEntry: userEntry,
      answerTime: answerTime,
      isCustomCorrect: isCorrect,
      bonus: typeof bonus === 'number' ? bonus : 0
    };
    if (!socket) console.warn('Socket not initialized — cannot emit answer-question');
    socket?.emit('answer-question', payload);
  };

  // When there is a pending final answer, emit it once bingo final bonus is settled.


  const handleCustomQuestion = () => {
    const questionText = session?.quiz.questions[questionIndexState].answers[0].text || '';
    const input = userInput.trim().toLowerCase();

    if (!questionText || !input) return false;

    const answers = questionText
      .split(',')
      .map(a => a.trim().toLowerCase())
      .filter(Boolean);
    const isMatch = answers.some(answer => input.includes(answer));

    return isMatch;
  };



  const handleTextSubmit = () => {
    setSelectedAnswer('custom');
    setWaiting(true);
    const isCorrect = handleCustomQuestion();
    setResult(isCorrect ? 'correct' : 'incorrect');
    const isFinal = questionIndexState >= (session?.quiz.questions.length ?? 0) - 1;
    console.log('isFinal:', isFinal);
    const tile = selectedTile;

    if (isCorrect) {
      markSelectedBingoCell(isFinal ? false : true);
    } else {
      setCanSelectTile(false);
      setAssignedAxis(null);
      setSelectedTile(null);
    }

    if (isFinal) {
      const increment = computeIncrement(isCorrect, tile);
      console.log('Final question bingo increment:', increment);
      if (increment > 0) {
        setFinalBingoBonus(prev => prev + increment);
        setBingoBonus(increment);
        setHasBingo(true);
      }
      sendQuestion(session?.quiz.questions[questionIndexState].id, null, userInput, Date.now(), isCorrect.toString(), increment);
    } else {
      sendQuestion(session?.quiz.questions[questionIndexState].id, null, userInput, Date.now(), isCorrect.toString(), 0);
    }
  };

  useEffect(() => {
    assignTileForQuestion();
  }, []);

  useEffect(() => {
    socket?.on('next-question', (index: number) => {
      setQuestionIndexState(index);
      setSelectedAnswer(null);
      setUserInput('null');
      setWaiting(false);
      setResult(null);
      setUserInput('');
      getUserIndex();
      assignTileForQuestion();
    });
    socket?.on('finish-question', (currentUsers: Array<AppUser | GuestUser>) => {
      setUsersState(currentUsers);
      setAverage(calcAverage(currentUsers));
      setWaiting(false);
      getUserIndex()
      if (questionIndexState >= session?.quiz.questions.length - 1) {
        setIsQuizOver(true);
      }
    });
    socket?.on('quiz-ended', (payload: any) => {
      console.log('Quiz ended payload:', payload);
        setUsersState(payload.state.players);
        setAverage(calcAverage(payload.state.players));
        getUserIndex();
      setIsQuizOver(true);
    });

    return () => {
      socket?.off('next-question');
      socket?.off('finish-question');
      socket?.off('quiz-ended');
    };
  }, [getUserIndex, navigate, questionIndexState]);

  useEffect(() => {
    // Removed end-of-quiz bingo calculation. Final bonus is computed
    // and applied immediately when the last question is answered.
  }, [isQuizOver]);


  const calcAverage = (currentUsers: Array<AppUser | GuestUser>) => {
    if (!currentUsers || currentUsers.length === 0) return 0;
    const total = currentUsers.reduce((sum, user) => sum + user.totalScore, 0);
    return Math.round(total / currentUsers.length);
  }

  if (isQuizOver) {
    return (
      <Card className={styles.card}>
        <>
          {(() => {
            const baseScore = usersState[userState]?.totalScore ?? 0;
            const displayedScore = baseScore;
            if (displayedScore >= average) {
              return (
                <>
                  <h1 className={styles.header2}>Odlično, {(usersState[userState]?.guestUsername) ? usersState[userState]?.guestUsername : usersState[userState]?.username}!</h1>
                  <Flex className={styles.flexContainer} gap="medium">
                    <div className={styles.scoreGood}>
                      <span className={styles.boxTitle}>Tvoj rezultat</span>
                      <span className={styles.boxValue}>{displayedScore} točk</span>
                    </div>
                    <div className={styles.avg}>
                      <span className={styles.boxTitle}>Povprečje</span>
                      <span className={styles.boxValue}>{average} točk</span>
                    </div>
                  </Flex>
                  <p className={styles.sentence}>Dosegli ste nadpovprečno število točk, čestitke! Le tako naprej!</p>
                  {finalBingoBonus > 0 && <p className={styles.bingoBonus}>🎉 BINGO! +{finalBingoBonus} bonus točk! 🎉</p>}
                </>
              );
            }

            return (
              <>
                <h1 className={styles.header2}>Skoraj, {(usersState[userState]?.guestUsername) ? usersState[userState]?.guestUsername : usersState[userState]?.username}!</h1>
                <Flex className={styles.flexContainer} gap="small">
                  <div className={styles.scoreBad}>
                    <span className={styles.boxTitle}>Tvoj rezultat</span>
                    <span className={styles.boxValue}>{displayedScore} točk</span>
                  </div>
                  <div className={styles.avg}>
                    <span className={styles.boxTitle}>Povprečje</span>
                    <span className={styles.boxValue}>{average} točk</span>
                  </div>
                </Flex>
                <p className={styles.sentence}>Dosegli ste podpovprečno število točk, saj bo! Malo truda pa bo bolje!</p>
                {finalBingoBonus > 0 && <p className={styles.bingoBonus}>🎉 BINGO! +{finalBingoBonus} bonus točk! 🎉</p>}
              </>
            );
          })()}
        </>

        <div className={styles.bingoContainerEnd}>
          <h3 className={styles.bingoTitle}>{hasBingo ? '🎉 BINGO! 🎉' : 'Tvoj Bingo 🎯'}</h3>
          <div className={styles.bingoBoard}>
            {bingoBoard.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isCenter = rowIndex === 2 && colIndex === 2;
                const cellNumber = rowIndex * 5 + colIndex + 1;
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`${styles.bingoCell} ${cell
                      ? isCenter
                        ? styles.bingoCellCenter
                        : styles.bingoCellMarked
                      : styles.bingoCellEmpty
                      }`}
                  >
                    {isCenter ? '★' : cellNumber}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <Flex className={styles.buttonContainer} gap="small">
          <Button className={styles.button} onClick={() => {
            const sessionId = gamerSessionId;
            closeSocket();
            clearSession();
            if (sessionId) {
              navigate('/reports', {
                state: {
                  sessionId: sessionId,
                  bingoBonus: finalBingoBonus,
                }
              });
            };
          }}>Poglej si poročilo</Button>
          <Button className={styles.homeButton} onClick={() => { clearSession(); closeSocket(); navigate("/"); }}>
            Domov
          </Button>
        </Flex>
      </Card>
    );
  } else {


    return (
      <Flex
        style={{ width: '100%', position: 'relative' }}
        vertical
        align="center"
        justify="center"
        className={styles.container}
      >
        {(questionIndexState > 0) ? <Card className={styles.infoCard}>
          <div className={styles.infoTitle}>Tvoja statistika</div>
          <div>Mesto: {userState + 1}</div>
          <div>Točke: {usersState[userState].totalScore}</div>
          {(userState == 0 && usersState.length > 1) ?
            <div>+{usersState[userState + 1].totalScore - usersState[userState].totalScore} točk da prehitiš igralca
              #{userState + 2}</div> : null}
          {(userState >= usersState.length && usersState.length > 1) ?
            <div>+{usersState[userState].totalScore - usersState[userState - 1].totalScore} točk pred igralcem
              #{userState}</div> : null}
        </Card> : null}

        {!selectedAnswer && <h1 className={styles.header}>ODGOVORI:</h1>}

        {selectedAnswer && waiting && (
          <h1
            className={styles.header}
          >
            Čakamo, da vsi zaključijo ...
          </h1>
        )}

        {result && !waiting && (
          <h1
            className={styles.header}
            style={{
              marginTop: '2rem',
              color: result === 'correct' ? '#4CAF50' : '#d33434',
            }}
          >
            {result === 'correct' ? 'Pravilen odgovor!' : 'Napačen odgovor!'}
          </h1>
        )}

        {session?.quiz.questions[questionIndexState].questionType == 'CUSTOM_ANWSER' &&
          !waiting &&
          !result &&
          !selectedAnswer && (
            <Form style={{ width: '80%' }} onFinish={handleTextSubmit}>
              <Form.Item name={['answer']}>
                <TextArea
                  autoSize={{ minRows: 5, maxRows: 5 }}
                  style={{
                    backgroundColor: '#fff',
                    color: '#000',
                    border: '15px solid #5FAFF5',
                  }}
                  className={styles.textField}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className={styles.commitButton}
              >
                Oddaj
              </Button>
            </Form>
          )}

        {session?.quiz.questions[questionIndexState].questionType == 'PRESET_ANWSER' &&
          !waiting &&
          !result &&
          !selectedAnswer && (
            <Form>
              <Flex wrap="wrap" justify="center" gap="large">
                {session?.quiz.questions[questionIndexState].answers?.map((answer: any, index: any) => {
                  const color = colorClasses[index % colorClasses.length];
                  return (
                    <Button
                      key={index}
                      type="default"
                      htmlType="button"
                      className={`${styles.textButton} ${color}`}
                      onClick={() => handleAnswer(answer, color)}
                    >
                      <div className={styles.textButtonContent}>
                        {answer.text}
                      </div>
                    </Button>
                  );
                })}
              </Flex>
            </Form>
          )}

        {session?.quiz.questions[questionIndexState].questionType == 'MEDIA_ANWSER' &&
          !waiting &&
          !result &&
          !selectedAnswer && (
            <Form>
              <Flex
                wrap="wrap"
                justify="center"
                align="center"
                gap="large"
                style={{ width: '100%' }}
              >
                {session?.quiz.questions[questionIndexState].answers.map((answer: Answer, index: any) => {
                  const color = colorClasses[index % colorClasses.length];
                  return (
                    <Button
                      key={index}
                      type="default"
                      htmlType="button"
                      className={`${styles.imageButton} ${color}`}
                      onClick={() => handleAnswer(answer, color)}
                    >
                      <div className={styles.imageWrapper}>
                        <Image
                          src={PICTURE_URL + answer?.media?.path}
                          preview={false}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      </div>
                    </Button>
                  );
                })}
              </Flex>
            </Form>
          )}

        {selectedAnswer != null && !waiting && (
          <div style={{ marginTop: '2rem' }}>
            {session?.quiz.questions[questionIndexState].questionType == 'CUSTOM_ANWSER' ? (
              <div className={
                result === 'correct'
                  ? styles.bounce
                  : result === 'incorrect'
                    ? styles.shake
                    : ''
              }
              >
                <span className={styles.spanText}> Tvoj odgovor: <span
                  style={{ color: 'Black' }}>{userInput} </span> </span>
              </div>
            ) : session?.quiz.questions[questionIndexState].questionType == 'PRESET_ANWSER' && !waiting ? (
              <Button
                type="text"
                className={
                  result === 'correct'
                    ? styles.bounceButton
                    : result === 'incorrect'
                      ? styles.shakeButton
                      : ''
                }
                disabled
              >
                <div className={styles.textButtonContent} style={{ "color": "white" }}>
                  {selectedAnswer.text}
                </div>
              </Button>
            ) : session?.quiz.questions[questionIndexState].questionType == 'MEDIA_ANWSER' && !waiting ? (
              <Button
                type="text"
                className={
                  result === 'correct'
                    ? styles.bounceButton
                    : result === 'incorrect'
                      ? styles.shakeButton
                      : ''
                } disabled
              >
                <div className={styles.imageWrapper}>
                  <Image
                    src={PICTURE_URL + selectedAnswer?.media.path}
                    preview={false}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </div>
              </Button>
            ) : null}
          </div>
        )}
        <div className={styles.bingoContainer}>
          <h3 className={styles.bingoTitle}>{hasBingo ? '🎉 BINGO! 🎉' : 'Tvoj Bingo 🎯'}</h3>
          {canSelectTile && assignedAxis && !selectedAnswer && (
            <p className={styles.bingoHint}>
              Izberi polje v {assignedAxis.axis === 'row' ? `vrstici ${assignedAxis.index + 1}` : `stolpcu ${assignedAxis.index + 1}`}
            </p>
          )}
          <div className={styles.bingoBoard}>
            {bingoBoard.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isCenter = rowIndex === 2 && colIndex === 2;
                const cellNumber = rowIndex * 5 + colIndex + 1;
                const isSelectable = isCellSelectable(rowIndex, colIndex) && !selectedAnswer;
                const isSelected = selectedTile?.r === rowIndex && selectedTile?.c === colIndex;

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => !selectedAnswer && handleTileClick(rowIndex, colIndex)}
                    className={`${styles.bingoCell} ${cell
                      ? isCenter
                        ? styles.bingoCellCenter
                        : styles.bingoCellMarked
                      : isSelected
                        ? styles.bingoCellSelected
                        : isSelectable
                          ? styles.bingoCellSelectable
                          : styles.bingoCellEmpty
                      } ${isSelectable && !cell ? styles.bingoCellClickable : ''}`}
                  >
                    {isCenter ? '★' : cellNumber}
                  </div>
                );
              })
            )}
          </div>
          {hasBingo && <p className={styles.bingoBonusSmall}>+{bingoBonus} bonus točk!</p>}
        </div>
      </Flex>
    );
  }
}
