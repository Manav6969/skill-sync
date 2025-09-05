'use client';
import React, { useEffect, useState } from 'react';
import Typewriter from 'typewriter-effect';
import Navbar from '@/components/Navbar';
import { fetchWithAuth } from '@/utils/fetchWithAuth';

const Skills = () => {
    const [skillsData, setSkillsData] = useState([]);

    useEffect(() => {
        const skillData = async () => {
            try {
                const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/skills`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await res.json();
                if (res.ok) {
                    setSkillsData(data);
                } else {
                    console.error('Failed to fetch skills data:', data.message);
                }
            } catch (error) {
                console.error('Error fetching skills data:', error);
            }
        };

        skillData();
    }, []);

    return (
        <>
            <Navbar></Navbar>
            <div className="min-h-screen bg-gradient-to-b from-black via-[#1f103f] to-purple-900 text-white px-4 py-12">
                <div className="max-w-3xl mx-auto space-y-8">
                    {skillsData.length === 0 || skillsData.every(user => user.skills.length === 0) ? (
                        <div className="text-center text-3xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-500 to-red-400 bg-clip-text text-transparent drop-shadow-lg animate-pulse">
                            <Typewriter
                                options={{
                                    strings: ['No Skills Added.', 'Add Skills to get started!'],
                                    autoStart: true,
                                    loop: true,
                                    delay: 50,
                                    deleteSpeed: 30,
                                }}
                            />
                        </div>
                    ) : (
                        skillsData.map((user, idx) => (

                            user.skills.length > 0 && (<div
                                key={idx}
                                className="bg-gray-800/70 border border-white/10 rounded-lg p-6 shadow-md"
                            >

                                <h2 className="text-2xl font-semibold text-purple-200 mb-4">
                                    @{user.name} Skills
                                </h2>
                                {user.skills.length > 0 ? (
                                    <ul className="grid md:grid-cols-2 gap-4">
                                        {user.skills.map((skill, i) => (
                                            <li
                                                key={i}
                                                className="bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700 p-4 rounded-lg shadow border border-white/10"
                                            >
                                                <p className="text-lg font-bold">{skill}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="italic text-gray-400">No skills yet.</p>
                                )}

                                <div className="mt-6">
                                    <h3 className="text-xl font-semibold text-pink-200 mb-2">Projects</h3>
                                    {user.projectlinks.length > 0 ? (
                                        <ul className="list-disc list-inside space-y-2">
                                            {user.projectlinks.map((project, j) => (
                                                <li key={j}>
                                                    <a
                                                        href={project}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-400 hover:underline"
                                                    >
                                                        {project}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="italic text-gray-400">No projects yet.</p>
                                    )}
                                </div>
                            </div>)


                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default Skills;
