'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { ToastContainer, toast } from 'react-toastify';
// import { Router } from 'next/router';
import { useRouter } from 'next/navigation';

const Dashboard = () => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [editing, setEditing] = useState(false);
    const [skillsInput, setSkillsInput] = useState('');
    const [showInvites, setShowInvites] = useState(false);
    const [invites, setInvites] = useState([]);


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



    const inviteUser = async () => {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/invites/yourInvites`, {
            method: 'GET',
            credentials: 'include',
        });
        if (res.ok) {
            const data = await res.json();
            if (data.length > 0) {
                setInvites(data);
                setShowInvites(true);
            }
        }
    }

    useEffect(() => {
        const usrData = async () => {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/getUser`, {
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setSkillsInput(data.skills?.join(', ') || '');
            }
            else {

            }
        }

        usrData();
        inviteUser();
    }, []);

    const handleSkillsSubmit = async (e) => {
        e.preventDefault();
        const updatedSkills = skillsInput
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);

        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/users/updateSkills`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ skills: updatedSkills }),
        });

        if (res.ok) {
            setUser((oldVal) => ({ ...oldVal, skills: updatedSkills }));
            setEditing(false);
        } else {
            toast.error('Failed to update skills', {
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

    const handleInvitationAccept = async (id) => {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/invites/accept/${id}`, {
            method: 'PUT',
            credentials: 'include',
        });
        if (res.ok) {
            setInvites((oldVal) => oldVal.filter((invite) => invite._id !== id));
            toast.success('Invitation accepted successfully', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                // transition: Bounce,
            });
            // alert('Invitation accepted successfully');
        } else {
            toast.error('Failed to accept invitation', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                // transition: Bounce,
            });
            // alert('Failed to accept invitation');
        }
        inviteUser();
    }

    const handleInvitationReject = async (id) => {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/invites/reject/${id}`, {
            method: 'PUT',
            credentials: 'include',
        });
        if (res.ok) {
            setInvites((oldVal) => oldVal.filter((invite) => invite._id !== id));
            toast.success('Invitation rejected successfully', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                // transition: Bounce,
            });
            // alert('Invitation rejected successfully');
        } else {
            toast.error('Failed to reject invitation', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                // transition: Bounce,
            });
            // alert('Failed to reject invitation');
        }
        inviteUser();
    }

    const [projectEditButton, setprojectEditButton] = useState(false);
    const [allProjects, setallProjects] = useState('');

    useEffect(() => {
        if (user) {
            setallProjects(user.projectlinks?.join('\n') || '');
        }
    }, [user]);

    const handleProjectsSubmit = async (e) => {
        e.preventDefault();
        const changedProjects = allProjects
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean);

        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/users/updateProjects`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ projectlinks: changedProjects }),
        });

        if (res.ok) {
            setUser((oldVal) => ({ ...oldVal, projectlinks: changedProjects }));
            setprojectEditButton(false);
        } else {
            toast.error('Failed to update project links', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                // transition: Bounce,
            });
            // alert('Failed to update project links');
        }
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
                theme="colored"
            />
            <Navbar></Navbar>
            <div className="min-h-screen w-full px-4 py-10 bg-gradient-to-br from-black via-indigo-950 to-purple-800 text-white">
                {user && (
                    <div className="flex flex-col items-center gap-2">
                        <img
                            src={user.avatar}
                            alt="Profile"
                            className="w-28 h-28 rounded-full border-4 border-purple-500 shadow-lg"
                        />
                        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 animate-pulse">
                            Welcome, {user.name}
                        </h2>
                        <p className="text-indigo-200 font-light">
                            <span className="font-semibold text-white">Email:</span> {user.email}
                        </p>
                    </div>
                )}

                <div className="mt-10 max-w-2xl mx-auto bg-gradient-to-br from-indigo-900 via-purple-900 to-purple-800/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-purple-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold text-white tracking-wide">Skills</h3>
                        <button
                            onClick={() => setEditing(!editing)}
                            className="text-sm text-purple-300 hover:text-white transition"
                        >
                            {editing ? 'Cancel' : 'Edit'}
                        </button>
                    </div>

                    {editing ? (
                        <form onSubmit={handleSkillsSubmit}>
                            <textarea
                                value={skillsInput}
                                onChange={(e) => setSkillsInput(e.target.value)}
                                placeholder="Enter comma-separated skills"
                                className="w-full bg-white text-black p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                rows={3}
                            />
                            <button
                                type="submit"
                                className="mt-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-2 px-4 rounded-lg hover:scale-105 hover:shadow-xl transition"
                            >
                                Save Skills
                            </button>
                        </form>
                    ) : (
                        <ul className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {user && user.skills && user.skills.length > 0 ? (
                                user.skills.map((skill, idx) => (
                                    <li
                                        key={idx}
                                        className="bg-indigo-700 text-white text-sm font-medium px-3 py-2 rounded-lg shadow hover:bg-indigo-800 transition"
                                    >
                                        {skill}
                                    </li>
                                ))
                            ) : (
                                <li className="col-span-full text-center text-white font-medium animate-pulse">No skills added.</li>
                            )}
                        </ul>
                    )}
                </div>


                <div className="mt-10 max-w-2xl mx-auto bg-gradient-to-br from-indigo-900 via-purple-900 to-purple-800/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-purple-700">
                    <h3 className="text-2xl font-bold text-white tracking-wide mb-4">Invites</h3>
                    {invites.length > 0 ? (
                        <ul className="space-y-3">
                            {invites.map((invite) => (
                                <li key={invite._id} className="p-4 bg-gray-100 rounded-lg shadow flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-semibold text-black">{invite.fromUser.name}</p>
                                        <p className="text-sm text-gray-600">Team: {invite.team.name}</p>
                                    </div>
                                    <div className="mt-2 sm:mt-0 flex space-x-2">
                                        <button
                                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                                            onClick={() => { handleInvitationAccept(invite._id) }}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                                            onClick={() => { handleInvitationReject(invite._id) }}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-300 animate-pulse">No pending invites.</p>
                    )}
                </div>

                <div className="mt-10 max-w-2xl mx-auto bg-gradient-to-br from-indigo-900 via-purple-900 to-purple-800/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-purple-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold text-white tracking-wide">Projects</h3>
                        <button
                            onClick={() => setprojectEditButton(!projectEditButton)}
                            className="text-sm text-purple-300 hover:text-white transition"
                        >
                            {projectEditButton ? 'Cancel' : 'Edit'}
                        </button>
                    </div>
                    {projectEditButton ? (
                        <form onSubmit={handleProjectsSubmit}>
                            <textarea
                                value={allProjects}
                                onChange={(e) => setallProjects(e.target.value)}
                                placeholder="Enter one project link per line"
                                className="w-full bg-white text-black p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                rows={3}
                            />
                            <button
                                type="submit"
                                className="mt-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-2 px-4 rounded-lg hover:scale-105 hover:shadow-xl transition"
                            >
                                Save Projects
                            </button>
                        </form>
                    ) : user && user.projectlinks && user.projectlinks.length > 0 ? (
                        <ul className="space-y-3">
                            {user.projectlinks.map((link, idx) => (
                                <li key={idx} className="flex items-center space-x-2">
                                    <a
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 text-white px-4 py-2 rounded-lg shadow hover:scale-105 hover:shadow-xl transition break-all font-medium"
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-purple-200 animate-pulse">No project links added.</p>
                    )}
                </div>
            </div>
        </>
    )
}

export default Dashboard