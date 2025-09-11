'use client';
import { useEffect, useState } from 'react';
import Typewriter from 'typewriter-effect';
import Navbar from '@/components/Navbar';
import TeamChatBox from '@/components/TeamChatBox';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { ToastContainer, toast } from 'react-toastify';

const TeamsPage = () => {
    const [competitionData, setCompetitionData] = useState([]);
    const [form, setForm] = useState({
        competitionName: '',
        teamName: '',
        teamDescription: '',
    });
    const [showInvite, setshowInvite] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [inviteEmail, setInviteEmail] = useState('');
    const [user, setUser] = useState(null);
    const router = useRouter();


    useEffect(() => {
        const isloggedin = async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/userAuthentication`, {
                method: 'GET',
                credentials: 'include',
            });
            if (!(res.ok)) {
                let token = localStorage.getItem('access_token');
                if (token) {
                    localStorage.removeItem('access_token');
                }
                const logres = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
                    method: 'GET',
                    credentials: 'include',
                });


                router.replace('/login')
            }
        }

        isloggedin()

    }, [])


    useEffect(() => {
        const fetchUserAndData = async () => {
            const usrData = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/getUser`, {
                credentials: 'include',
            });
            if (usrData.ok) {
                const userData = await usrData.json();
                setUser(userData);
            }

            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/teams/all`, {
                credentials: 'include',
            });
            const data = await res.json();
            setCompetitionData(data);
        }
        fetchUserAndData();
    }, []);

    const handleCreateTeam = async (e) => {
        e.preventDefault();

        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/teams/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(form),
        });

        if (res.ok) {
            toast.success('✅ Team Created!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
            setForm({ competitionName: '', teamName: '', teamDescription: '' });

            const updated = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/teams/all`, {
                credentials: 'include',
            });
            const changedData = await updated.json();
            setCompetitionData(changedData);
        } else {
            toast.error('Failed to Create', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
        }
    };

    const handleInviteSubmit = async (e) => {
        e.preventDefault();
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/invites/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email: inviteEmail, teamId: selectedTeamId }),
        });

        const result = await res.json();
        toast.info(`${result.message}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
        });
        // alert(result.message);
        setshowInvite(false);
        setInviteEmail('');
    };

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <Navbar></Navbar>
            <div className="min-h-screen bg-gradient-to-b from-black via-[#1f103f] to-purple-900 text-white px-4 py-12">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-purple-400 via-pink-500 to-red-400 bg-clip-text text-transparent drop-shadow-lg">
                        Team Manager
                    </h1>

                    <form
                        onSubmit={handleCreateTeam}
                        className="bg-gray-900/70 border border-white/10 rounded-xl p-6 mb-10 shadow-lg space-y-4"
                    >
                        <input
                            type="text"
                            placeholder="Competition Name"
                            value={form.competitionName}
                            onChange={(e) => setForm({ ...form, competitionName: e.target.value })}
                            className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Team Name"
                            value={form.teamName}
                            onChange={(e) => setForm({ ...form, teamName: e.target.value })}
                            className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                        />
                        <textarea
                            placeholder="Team Description"
                            value={form.teamDescription}
                            onChange={(e) => setForm({ ...form, teamDescription: e.target.value })}
                            className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            rows={3}
                        ></textarea>
                        <button
                            type="submit"
                            className="w-full py-3 rounded-md bg-purple-600 hover:bg-purple-700 transition-all text-white font-semibold"
                        >
                            Create Team
                        </button>
                    </form>

                    <div className="space-y-8">
                        {competitionData.length === 0 ? (
                            <div className="text-center text-3xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-500 to-red-400 bg-clip-text text-transparent drop-shadow-lg animate-pulse">
                                <Typewriter
                                    options={{
                                        strings: ['No competitions found.', 'Create a team to get started!'],
                                        autoStart: true,
                                        loop: true,
                                        delay: 50,
                                        deleteSpeed: 30,
                                    }}
                                />
                            </div>
                        ) : (
                            competitionData.map((comp, idx) => (
                                <div key={idx} className="bg-gray-800/70 border border-white/10 rounded-lg p-6 shadow-md">
                                    <h2 className="text-2xl font-semibold text-purple-200 mb-4">
                                        🏆 {comp.name}
                                    </h2>
                                    {comp.team.length > 0 ? (
                                        <ul className="grid md:grid-cols-2 gap-4">
                                            {comp.team.map((team) => (
                                                <li
                                                    key={team._id}
                                                    className="bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700 p-4 rounded-lg shadow border border-white/10"
                                                >
                                                    <p className="text-lg font-bold">{team.name}</p>
                                                    <p className="text-sm text-purple-100 mb-2">{team.description}</p>
                                                    <p className="text-sm text-pink-200">
                                                        <span className="font-semibold">Members: </span>
                                                        {team.members.length > 0 ?
                                                            team.members.map((m) => m.name).join(', ') :
                                                            <span className="italic text-gray-300">No members</span>}
                                                    </p>
                                                    {user && user._id === team.createdBy._id && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedTeamId(team._id);
                                                                setshowInvite(true);
                                                            }}
                                                            className="mt-2 bg-white text-purple-800 text-sm font-semibold px-3 py-1 rounded hover:bg-purple-200"
                                                        >
                                                            Invite Member
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => router.push(`/chat/${team._id}`)}
                                                        className="mt-2 ml-2 bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded hover:bg-blue-700"
                                                    >
                                                        Open Chat
                                                    </button>


                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="italic text-gray-400">No teams yet.</p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>


            {showInvite && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white text-black rounded-lg p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">Invite User by Email</h3>
                        <form onSubmit={handleInviteSubmit} className="space-y-4">
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                required
                                placeholder="example@domain.com"
                                className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setshowInvite(false)}
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                                >
                                    Send Invite
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default TeamsPage