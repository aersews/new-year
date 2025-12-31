'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('users'); // users, logs, blocked

    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [blockedUsers, setBlockedUsers] = useState([]);

    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        displayName: '',
        gratitudeContent: '',
        questions: [],
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            if (activeTab === 'users') fetchUsers();
            if (activeTab === 'logs') fetchLogs();
            if (activeTab === 'blocked') fetchBlocked();
        }
    }, [isAuthenticated, activeTab]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
                setIsAuthenticated(true);
            }
        } catch (e) { console.error(e); }
    };

    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/admin/logs');
            if (res.ok) setLogs(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchBlocked = async () => {
        try {
            const res = await fetch('/api/admin/blocked');
            if (res.ok) setBlockedUsers(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            body: JSON.stringify({ password }),
        });
        if (res.ok) {
            setIsAuthenticated(true);
            fetchUsers();
        } else {
            alert('Invalid password');
        }
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        const isNew = !editingUser._id;
        const url = isNew ? '/api/admin/users' : `/api/admin/users/${editingUser._id}`;
        const method = isNew ? 'POST' : 'PUT';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (res.ok) {
            setEditingUser(null);
            fetchUsers();
        } else {
            alert('Error saving user');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return;
        const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
        if (res.ok) fetchUsers();
    };

    const handleUnblock = async (identifier) => {
        if (!confirm('Unblock this user?')) return;
        const res = await fetch('/api/admin/blocked', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier })
        });
        if (res.ok) fetchBlocked();
    };

    const startEdit = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({ ...user });
        } else {
            setEditingUser({});
            setFormData({
                name: '',
                displayName: '',
                gratitudeContent: '<p>Happy New Year!</p>',
                questions: [
                    { id: 'q1', text: 'What is my favorite color?', type: 'text', answer: 'Blue' }
                ],
            });
        }
    };

    const updateQuestion = (idx, field, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[idx] = { ...newQuestions[idx], [field]: value };
        setFormData({ ...formData, questions: newQuestions });
    };

    const addQuestion = () => {
        setFormData({
            ...formData,
            questions: [...formData.questions, { id: `q${Date.now()}`, text: '', type: 'text', answer: '' }]
        });
    };

    const removeQuestion = (idx) => {
        const newQuestions = formData.questions.filter((_, i) => i !== idx);
        setFormData({ ...formData, questions: newQuestions });
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg">
                    <h1 className="text-xl font-bold mb-4">Admin Login</h1>
                    <Input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Password"
                        className="mb-4"
                    />
                    <Button type="submit" className="w-full">Login</Button>
                </form>
            </div>
        );
    }

    if (editingUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="px-8 py-6 border-b bg-gray-50">
                        <h2 className="text-3xl font-extrabold text-gray-800">
                            {editingUser._id ? 'Edit User Profile' : 'Create New User'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Configure identity, verification questions, and gratitude message.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSaveUser} className="p-8 space-y-10">
                        {/* Identity */}
                        <section>
                            <h3 className="text-lg font-bold text-gray-700 mb-4">Identity</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Search Name
                                    </label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. john_doe (lowercase)"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        Used for lookup & verification
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Display Name
                                    </label>
                                    <Input
                                        value={formData.displayName}
                                        onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Gratitude Content */}
                        <section>
                            <h3 className="text-lg font-bold text-gray-700 mb-4">
                                Gratitude Message
                            </h3>
                            <textarea
                                className="w-full p-4 border rounded-2xl h-48 font-mono text-sm focus:ring-2 focus:ring-blue-200"
                                value={formData.gratitudeContent}
                                onChange={e =>
                                    setFormData({ ...formData, gratitudeContent: e.target.value })
                                }
                                placeholder="<p>Your heartfelt message goes here...</p>"
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                HTML supported. Rendered after successful verification.
                            </p>
                        </section>

                        {/* Questions */}
                        <section>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-700">
                                    Verification Questions
                                </h3>
                                <Button
                                    type="button"
                                    onClick={addQuestion}
                                    className="text-sm px-4 py-2"
                                >
                                    + Add Question
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {formData.questions.map((q, idx) => (
                                    <div
                                        key={idx}
                                        className="relative p-5 bg-gray-50 border rounded-2xl"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(idx)}
                                            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
                                            title="Remove question"
                                        >
                                            ✕
                                        </button>

                                        <div className="space-y-3">
                                            <Input
                                                placeholder="Question text"
                                                value={q.text}
                                                onChange={e =>
                                                    updateQuestion(idx, 'text', e.target.value)
                                                }
                                            />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <select
                                                    className="p-2 border rounded-xl"
                                                    value={q.type}
                                                    onChange={e =>
                                                        updateQuestion(idx, 'type', e.target.value)
                                                    }
                                                >
                                                    <option value="text">Text Answer</option>
                                                    <option value="choice">Multiple Choice</option>
                                                </select>

                                                <Input
                                                    placeholder="Correct answer"
                                                    value={q.answer}
                                                    onChange={e =>
                                                        updateQuestion(idx, 'answer', e.target.value)
                                                    }
                                                />
                                            </div>

                                            {q.type === 'choice' && (
                                                <Input
                                                    placeholder="Options (comma separated)"
                                                    value={q.options?.join(', ') || ''}
                                                    onChange={e =>
                                                        updateQuestion(
                                                            idx,
                                                            'options',
                                                            e.target.value
                                                                .split(',')
                                                                .map(s => s.trim())
                                                        )
                                                    }
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button type="submit" className="px-8">
                                Save Changes
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setEditingUser(null)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 bg-gray-50">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <h1 className="text-3xl font-extrabold text-gray-800">Admin Dashboard</h1>
                    <Button onClick={() => startEdit()} className="whitespace-nowrap">
                        + Add User
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-200 overflow-x-auto">
                    {['users', 'logs', 'blocked'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 font-medium capitalize transition-colors ${activeTab === tab
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab === 'users' ? 'Manage Users' : tab === 'logs' ? 'Access Logs' : 'Blocked Users'}
                        </button>
                    ))}
                </div>

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="grid gap-4">
                        {users.length ? (
                            users.map(user => (
                                <div key={user._id} className="bg-white p-6 rounded-xl shadow flex justify-between items-center hover:shadow-lg transition">
                                    <div>
                                        <h3 className="font-bold text-lg">{user.displayName}</h3>
                                        <p className="text-gray-500 text-sm">
                                            @{user.name} • {user.questions.length} questions
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={() => startEdit(user)} className="bg-blue-500 text-sm py-2 px-4 hover:bg-blue-600">Edit</Button>
                                        <Button onClick={() => handleDelete(user._id)} className="bg-red-500 text-sm py-2 px-4 hover:bg-red-600">Delete</Button>
                                        <a href={`/gratitude/${user._id}`} target="_blank" className="text-blue-500 underline text-sm flex items-center hover:text-blue-600">View</a>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-6">No users found.</p>
                        )}
                    </div>
                )}

                {/* Logs Tab */}
                {activeTab === 'logs' && (
                    <div className="bg-white rounded-xl shadow overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-gray-100 text-gray-600 font-medium">
                                <tr>
                                    <th className="p-4">Time</th>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Action</th>
                                    <th className="p-4">Input</th>
                                    <th className="p-4">Device</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length ? logs.map(log => (
                                    <tr key={log._id} className="border-b last:border-0 hover:bg-gray-50 transition">
                                        <td className="p-4 text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                                        <td className="p-4 font-medium">{log.userId?.displayName || 'Unknown'}</td>
                                        <td className="p-4 text-gray-500">{log.questionId}</td>
                                        <td className="p-4 font-mono">{log.answer}</td>
                                        <td className="p-4">
                                            <div className="text-xs text-gray-500">{log.ip}</div>
                                            <div>{log.deviceInfo}</div>
                                        </td>
                                        <td className="p-4">
                                            {log.blocked ? (
                                                <span className="text-red-600 font-bold">BLOCKED</span>
                                            ) : log.isCorrect ? (
                                                <span className="text-green-600 font-bold">SUCCESS</span>
                                            ) : (
                                                <span className="text-orange-500">WRONG</span>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500">No logs found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Blocked Users Tab */}
                {activeTab === 'blocked' && (
                    <div className="bg-white rounded-xl shadow overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-gray-100 text-gray-600 font-medium">
                                <tr>
                                    <th className="p-4">Identifier</th>
                                    <th className="p-4">Target User</th>
                                    <th className="p-4">Attempts</th>
                                    <th className="p-4">Blocked Until</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {blockedUsers.length ? blockedUsers.map(u => (
                                    <tr key={u._id} className="border-b last:border-0 hover:bg-gray-50 transition">
                                        <td className="p-4 font-mono text-xs max-w-xs truncate" title={u.identifier}>{u.identifier}</td>
                                        <td className="p-4 font-medium">{u.lastAttemptedUserId?.displayName || 'Unknown'}</td>
                                        <td className="p-4">{u.count}</td>
                                        <td className="p-4 text-red-600">{new Date(u.blockedUntil).toLocaleString()}</td>
                                        <td className="p-4">
                                            <Button
                                                onClick={() => handleUnblock(u.identifier)}
                                                className="bg-green-500 hover:bg-green-600 text-xs py-1 px-3"
                                            >
                                                Unblock
                                            </Button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">No blocked users.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
        </div>
    );
}
