import React, { useContext, useEffect, useState } from 'react';
import { Card, Table, Select, DatePicker, Spin, Tag, Empty } from 'antd';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrophyOutlined, RiseOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import styles from './Dashboard.module.css';
import { UserContext } from '../../context/UserContext';
import { API_URL } from '../../api';
import type { StudentReport } from '../../fetch/types';

const { RangePicker } = DatePicker;

interface DashboardStats {
  totalQuizzes: number;
  averageScore: number;
  totalCorrect: number;
  recentStreak: number;
}

interface QuizHistory {
  key: string;
  quizName: string;
  subject: string;
  score: number;
  percentage: number;
  date: string;
  difficulty?: string;
}

export default function Dashboard() {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalQuizzes: 0,
    averageScore: 0,
    totalCorrect: 0,
    recentStreak: 0,
  });
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [subjectData, setSubjectData] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch user's quiz history and stats
      // Note: This would need a backend API endpoint to get user's quiz history
      const res = await fetch(`${API_URL}/users/${user?.id}/dashboard`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setQuizHistory(data.quizHistory);
        setProgressData(data.progressData);
        setSubjectData(data.subjectData);
      } else {
        // Mock data for demonstration
        generateMockData();
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use mock data if API fails
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    // Generate mock data for demonstration
    setStats({
      totalQuizzes: 12,
      averageScore: 78.5,
      totalCorrect: 94,
      recentStreak: 5,
    });

    const mockHistory: QuizHistory[] = [
      { key: '1', quizName: 'Matematika - Algebra', subject: 'Matematika', score: 85, percentage: 85, date: '2024-01-15', difficulty: 'Medium' },
      { key: '2', quizName: 'Zgodovina - Rimski časi', subject: 'Zgodovina', score: 72, percentage: 72, date: '2024-01-10', difficulty: 'Hard' },
      { key: '3', quizName: 'Angleščina - Grammar', subject: 'Angleščina', score: 90, percentage: 90, date: '2024-01-05', difficulty: 'Easy' },
      { key: '4', quizName: 'Fizika - Mehanika', subject: 'Fizika', score: 65, percentage: 65, date: '2023-12-28', difficulty: 'Hard' },
      { key: '5', quizName: 'Biologija - Celice', subject: 'Biologija', score: 88, percentage: 88, date: '2023-12-20', difficulty: 'Medium' },
    ];
    setQuizHistory(mockHistory);

    const mockProgress = [
      { month: 'Sep', score: 65 },
      { month: 'Oct', score: 70 },
      { month: 'Nov', score: 75 },
      { month: 'Dec', score: 72 },
      { month: 'Jan', score: 82 },
    ];
    setProgressData(mockProgress);

    const mockSubjects = [
      { name: 'Matematika', value: 85, color: '#3B82F6' },
      { name: 'Zgodovina', value: 72, color: '#8B5CF6' },
      { name: 'Angleščina', value: 90, color: '#10B981' },
      { name: 'Fizika', value: 65, color: '#F59E0B' },
      { name: 'Biologija', value: 88, color: '#EF4444' },
    ];
    setSubjectData(mockSubjects);
  };

  const columns = [
    {
      title: 'Kviz',
      dataIndex: 'quizName',
      key: 'quizName',
    },
    {
      title: 'Predmet',
      dataIndex: 'subject',
      key: 'subject',
      render: (subject: string) => (
        <Tag color="blue" className={styles.subjectTag}>{subject}</Tag>
      ),
    },
    {
      title: 'Zahtevnost',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (difficulty?: string) => {
        if (!difficulty) return '-';
        const colorMap = { Easy: 'green', Medium: 'orange', Hard: 'red' };
        const labelMap = { Easy: 'Lahko', Medium: 'Srednje', Hard: 'Težko' };
        return <Tag color={colorMap[difficulty as keyof typeof colorMap]}>{labelMap[difficulty as keyof typeof labelMap]}</Tag>;
      },
    },
    {
      title: 'Rezultat',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage: number) => (
        <span style={{ color: percentage >= 80 ? '#10B981' : percentage >= 60 ? '#F59E0B' : '#EF4444' }}>
          {percentage}%
        </span>
      ),
      sorter: (a: QuizHistory, b: QuizHistory) => a.percentage - b.percentage,
    },
    {
      title: 'Datum',
      dataIndex: 'date',
      key: 'date',
      sorter: (a: QuizHistory, b: QuizHistory) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
  ];

  const filteredHistory = selectedSubject === 'all'
    ? quizHistory
    : quizHistory.filter(q => q.subject === selectedSubject);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🔒</div>
        <h2>Prijava potrebna</h2>
        <p>Prijavite se, da si ogledate vaš nadzorni panel</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>📊 Moj nadzorni panel učenja</h1>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <TrophyOutlined style={{ fontSize: 32, color: '#F59E0B' }} />
          <div className={styles.statValue}>{stats.totalQuizzes}</div>
          <div className={styles.statLabel}>Opravljenih kvizov</div>
        </Card>

        <Card className={styles.statCard}>
          <RiseOutlined style={{ fontSize: 32, color: '#3B82F6' }} />
          <div className={styles.statValue}>{stats.averageScore.toFixed(1)}%</div>
          <div className={styles.statLabel}>Povprečen rezultat</div>
        </Card>

        <Card className={styles.statCard}>
          <CheckCircleOutlined style={{ fontSize: 32, color: '#10B981' }} />
          <div className={styles.statValue}>{stats.totalCorrect}</div>
          <div className={styles.statLabel}>Pravilnih odgovorov</div>
        </Card>

        <Card className={styles.statCard}>
          <ClockCircleOutlined style={{ fontSize: 32, color: '#8B5CF6' }} />
          <div className={styles.statValue}>{stats.recentStreak}</div>
          <div className={styles.statLabel}>Zaporedni kvizi</div>
        </Card>
      </div>

      {/* Progress Chart */}
      <div className={styles.chartContainer}>
        <h2 className={styles.chartTitle}>📈 Napredek skozi čas</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="month" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Legend />
            <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={3} name="Rezultat %" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Subject Performance */}
      <div className={styles.chartContainer}>
        <h2 className={styles.chartTitle}>📚 Rezultati po predmetih</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={subjectData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Legend />
            <Bar dataKey="value" name="Rezultat %" radius={[8, 8, 0, 0]}>
              {subjectData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quiz History */}
      <div className={styles.tableContainer}>
        <h2 className={styles.chartTitle}>📝 Zgodovina kvizov</h2>
        <div className={styles.filterSection}>
          <Select
            defaultValue="all"
            style={{ width: 200 }}
            onChange={setSelectedSubject}
            options={[
              { value: 'all', label: 'Vsi predmeti' },
              ...Array.from(new Set(quizHistory.map(q => q.subject))).map(s => ({ value: s, label: s })),
            ]}
          />
        </div>
        
        {filteredHistory.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredHistory}
            pagination={{ pageSize: 10 }}
          />
        ) : (
          <Empty description="Ni opravljenih kvizov" />
        )}
      </div>
    </div>
  );
}
